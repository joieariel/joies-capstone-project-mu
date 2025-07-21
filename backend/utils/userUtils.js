const { PrismaClient } = require("@prisma/client");
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

module.exports = {
  getUserIdFromSupabase,
};
