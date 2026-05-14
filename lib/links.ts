import { supabase } from "./supabase";

export async function getLinks() {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching links:", error);
    return [];
  }

  return data;
}
