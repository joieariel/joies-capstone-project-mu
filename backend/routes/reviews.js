const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/auth"); // imports middleware function that verifies jwt tokens to verify user identity before allowing operations
const router = express.Router();
const prisma = new PrismaClient();

// helper function to get user id from supabase user
const getUserIdFromSupabase = async (supabaseUserId) => {
  const user = await prisma.user.findUnique({
    // find user record by supabase id field and return id
    where: { supabase_user_id: supabaseUserId },
    select: { id: true },
  });
  return user?.id;
};

// (GET) fetch all reviews (for testing)
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        images: true,
        // include reviewTags relationship and include tag data
        reviewTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: error.message });
  }
});

// (GET) fetch all reviews for a specific community center
router.get("/center/:center_id", async (req, res) => {
  try {
    const { center_id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { center_id: parseInt(center_id) },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        // include reviewTags relationship and include tag data
        images: true,
        reviewTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { created_at: "desc" }, // sort by newest first
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      error: "Failed to fetch reviews for community center",
      details: error.message,
    }); //more detailed error message
  }
});

// (POST) create a new review for a specific community center
// protected - requires authentication
router.post("/", authenticateUser, async (req, res) => {
  try {
    // convert supabase id to database integer id from authenticated user instead of request body
    //  prevents users from creating reviews as other users
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    // extract data from request body (no longer accepting user_id since we get it from authentication)
    const { rating, comment, center_id, image_urls, selected_tags } = req.body;

    // validate if selected_tags exists and is an array with maximum 5 tags
    if (
      selected_tags &&
      (!Array.isArray(selected_tags) || selected_tags.length > 5)
    ) {
      return res
        .status(400)
        .json({ error: "selected_tags must be an array with maximum 5 tags" });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        user_id: userId, // use the userId we got from the authenticated user
        center_id: parseInt(center_id), // convert string to integer
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
      },
    });

    // handle selected tags - add them to the community center and review
    // validate that selected_tags exists and is not empty
    if (selected_tags && selected_tags.length > 0) {
      for (const tagId of selected_tags) {
        try {
          // add tag to review using ReviewTag model to link review and tag
          await prisma.reviewTag.create({
            data: {
              review_id: newReview.id, // links to review just created
              tag_id: parseInt(tagId), // links to selected tag
            },
          });
        } catch (tagError) {
          // if P2002 (unique constraint violation), tag already exists for this review skip to prevent dups
          if (tagError.code !== "P2002") {
            console.error("Error adding tag to review:", tagError);
          }
        }

        try {
          // attempt to create the center-tag relationship
          // if it already exists, the unique constraint will prevent duplicates
          await prisma.centerTag.create({
            data: {
              center_id: parseInt(center_id),
              tag_id: parseInt(tagId),
            },
          });
        } catch (tagError) {
          // if P2002 (unique constraint violation), tag already exists for this center - skip
          if (tagError.code !== "P2002") {
            console.error("Error adding tag to center:", tagError);
          }
        }
      }
    }

    // if image urls are provided
    if (image_urls && image_urls.length > 0) {
      //create multiple ReviewImage records
      await prisma.reviewImage.createMany({
        data: image_urls.map((url) => ({
          image_url: url,
          review_id: newReview.id, // link to review just created
        })),
      });

      // fetch the review again to get images created
      const reviewWithImages = await prisma.review.findUnique({
        where: { id: newReview.id },
        include: {
          images: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
            },
          },
        },
      });
      // return review w images
      res.status(201).json(reviewWithImages);
    } else {
      // if no images provide, return review as is
      res.status(201).json(newReview);
    }
  } catch (error) {
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ error: "Failed to create review", details: error.message });
  }
});

// (PUT) edit existing review
//  protected - requires authentication and authorization (valid jwt token)
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, image_urls, selected_tags } = req.body;

    // validate selected_tags if provided
    if (
      selected_tags &&
      (!Array.isArray(selected_tags) || selected_tags.length > 3)
    ) {
      return res
        .status(400)
        .json({ error: "selected_tags must be an array with maximum 3 tags" });
    }

    // get db user ID from authenticated user
    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    // check if the review exists and belongs to the authenticated user
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: { user_id: true, center_id: true }, // add centerid bc we need to know which center to add tags to
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // only the review author can update their review
    if (existingReview.user_id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only edit your own reviews.",
      });
    }

    // Update the review data
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        rating,
        comment,
      },
    });

    // handle selected tags - update review tags and add to community center
    if (selected_tags && selected_tags.length > 0) {
      // first, remove existing tags from review
      // ensures old tag selection is replaced with the new one
      await prisma.reviewTag.deleteMany({
        where: { review_id: parseInt(id) },
      });

      // then add new tags to review and center
      for (const tagId of selected_tags) {
        try {
          // create new reviewtag entries for updated selection (add tag to review)
          await prisma.reviewTag.create({
            data: {
              review_id: parseInt(id), // links to review just updated
              tag_id: parseInt(tagId), // links to newly selected tag
            },
          });
        } catch (tagError) {
          // if P2002 (unique constraint violation), tag already exists for this review - skip
          if (tagError.code !== "P2002") {
            console.error("Error adding tag to review:", tagError);
          }
        }

        try {
          // attempt to create the center-tag relationship
          // if it already exists, the unique constraint will prevent duplicates
          await prisma.centerTag.create({
            data: {
              center_id: existingReview.center_id,
              tag_id: parseInt(tagId),
            },
          });
        } catch (tagError) {
          // if P2002 (unique constraint violation), tag already exists for this center - skip
          if (tagError.code !== "P2002") {
            console.error("Error adding tag to center:", tagError);
          }
        }
      }
    }

    // if image_urls are provided, update the images
    if (image_urls !== undefined) {
      // delete all existing images for this review
      await prisma.reviewImage.deleteMany({
        where: { review_id: parseInt(id) },
      });

      // Create new images if URLs are provided
      if (image_urls && image_urls.length > 0) {
        await prisma.reviewImage.createMany({
          data: image_urls.map((url) => ({
            image_url: url,
            review_id: parseInt(id),
          })),
        });
      }
    }

    // Fetch the updated review with images and user info
    const reviewWithImages = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
      },
    });

    res.json(reviewWithImages);
  } catch (error) {
    console.error("Error updating review:", error);
    res
      .status(500)
      .json({ error: "Failed to update review", details: error.message });
  }
});

// (DELETE) delete existing review
//protected - requires authentication and authorization
router.delete("/:id", authenticateUser, async (req, res) => {
  // added authenticateUser middleware
  try {
    const { id } = req.params;

    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: { user_id: true },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // only the review author can delete their review
    if (existingReview.user_id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own reviews.",
      });
    }

    // first delete all associated images
    await prisma.reviewImage.deleteMany({
      where: { review_id: parseInt(id) },
    });

    // delete all associated review tags
    await prisma.reviewTag.deleteMany({
      where: { review_id: parseInt(id) },
    });

    // now delete the review
    await prisma.review.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res
      .status(500)
      .json({ error: "Failed to delete review", details: error.message });
  }
});

// new endpoints below for better user friendly experience
// my original implementation was to have one PUT request to update a review
// however, if a user wanted to update the images they did not have that option
// so I added new endpoints to update the images separately

// (POST) add new images to an existing review
// protected
router.post("/:id/images", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_urls } = req.body;

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return res
        .status(400)
        .json({ error: "image_urls array is required and cannot be empty" });
    }

    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: { user_id: true },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // only the review author can add images to their review
    if (review.user_id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only add images to your own reviews.",
      });
    }

    // create new images
    await prisma.reviewImage.createMany({
      data: image_urls.map((url) => ({
        image_url: url,
        review_id: parseInt(id),
      })),
    });

    // return updated review with all images
    const updatedReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(updatedReview);
  } catch (error) {
    console.error("Error adding images to review:", error);
    res.status(500).json({
      error: "Failed to add images to review",
      details: error.message,
    });
  }
});

// (DELETE) delete a specific image from a review
// protected - requires authentication and authorization
router.delete("/:id/images/:image_id", authenticateUser, async (req, res) => {
  try {
    const { id, image_id } = req.params;

    const userId = await getUserIdFromSupabase(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in database" });
    }

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: { user_id: true },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // only the review author can delete images from their review
    if (review.user_id !== userId) {
      return res.status(403).json({
        error:
          "Access denied. You can only delete images from your own reviews.",
      });
    }

    // check if the image exists and belongs to the specified review
    const image = await prisma.reviewImage.findFirst({
      where: {
        id: parseInt(image_id),
        review_id: parseInt(id),
      },
    });

    if (!image) {
      return res
        .status(404)
        .json({ error: "Image not found or does not belong to this review" });
    }

    // delete the image
    await prisma.reviewImage.delete({
      where: { id: parseInt(image_id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ error: "Failed to delete image", details: error.message });
  }
});

module.exports = router;
