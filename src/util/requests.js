import { supabaseClient } from "./supabaseClient";

// Function to fetch todos from Supabase
export const getTodos = async ({ userId, token }) => {
  const supabase = await supabaseClient(token);
  const { data: educationLevels, error } = await supabase
    .from("education_level")
    .select("*");

  if (error) {
    console.error("Error fetching todos:", error.message);
    return [];
  }

  return educationLevels;
};

export const getSupabaseTables = async (supabase) => {
  const results = await Promise.all([
    supabase.from("users").select(`*`),
    supabase.from("education_level").select(`
            *,
            users (
                user_id
            )`),
    supabase.from("roles").select(`
            *
            users (
                user_id
            )`),
  ]);
  const users = results[0].data;
  const usersError = results[0].error;
  const educationLevels = results[1].data;
  const educationLevelsError = results[1].error;
  const userRoles = results[2].data;
  const userRolesError = results[2].error;
  return {
    users,
    usersError,
    educationLevels,
    educationLevelsError,
    userRoles,
    userRolesError,
  };
};

export const dbAssignRole = async (supabase, userId, roleId) => {
  const { data, error } = await supabase.rpc("insert_user_role", {
    insert_user_id: userId,
    insert_role_id: roleId,
  });
  if (error) {
    console.error("Error setting role:", error.message);
    return [];
  }
  return data;
};

export const dbAssignEducationLevel = async (
  supabase,
  userId,
  educationLevelId,
) => {
  const { data, error } = await supabase.rpc("upsert_user_education", {
    insert_user_id: userId,
    insert_education_level_id: educationLevelId,
  });
  if (error) {
    console.error("Error setting role:", error.message);
    return [];
  }
  return data;
};
