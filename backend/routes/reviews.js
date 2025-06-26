const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

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
        images: true,
      },
      orderBy: { created_at: "desc" }, // sort by newest first
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews for community center", details: error.message }); //more detailed error message
  }
});

// (POST) create a new review for a specific community center
router.post("/", async (req, res) => {
  try {
    // extract data from request body
    const { rating, comment, user_id, center_id, image_urls } = req.body;

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        user_id,
        center_id,
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
    res.status(500).json({ error: "Failed to create review" });
  }
});

// (PUT) edit existing review
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, image_urls } = req.body;

    // Update the review data
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        rating,
        comment,
      },
    });

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
    res.status(500).json({ error: "Failed to update review", details: error.message });
  }
});

// (DELETE) delete existing review
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // first delete all associated images
    await prisma.reviewImage.deleteMany({
      where: { review_id: parseInt(id) },
    });

    // now delete the review
    await prisma.review.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review", details: error.message });
  }
});

// new endpoints below for better user friendly experience
// my original implementation was to have one PUT request to update a review
// however, if a user wanted to update the images they did not have that option
// so I added new endpoints to update the images separately

// (POST) add new images to an existing review
router.post("/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const { image_urls } = req.body;

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return res.status(400).json({ error: "image_urls array is required and cannot be empty" });
    }

    // check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
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
    res.status(500).json({ error: "Failed to add images to review", details: error.message });
  }
});

// (DELETE) delete a specific image from a review
router.delete("/:id/images/:image_id", async (req, res) => {
  try {
    const { id, image_id } = req.params;

    // check if the image exists and belongs to the specified review
    const image = await prisma.reviewImage.findFirst({
      where: {
        id: parseInt(image_id),
        review_id: parseInt(id),
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found or does not belong to this review" });
    }

    // delete the image
    await prisma.reviewImage.delete({
      where: { id: parseInt(image_id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image", details: error.message });
  }
});

module.exports = router;
