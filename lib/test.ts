import { supabase } from "./supabase";

export async function testConnection() {
  const { data, error } = await supabase.from("links").select("*");

  console.log(data, error);
}
