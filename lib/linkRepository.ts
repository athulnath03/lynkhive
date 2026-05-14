import { createClient } from "@supabase/supabase-js";
import { DevLink, LinkRepository, NewLinkPayload } from "@/types";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const filePath = path.resolve("./data/links.json");

function ensureFile() {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

function read(): DevLink[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function write(data: DevLink[]) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const mockRepository: LinkRepository = {
  async getAll(): Promise<DevLink[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
},

  async getById(id: string) {
    return read().find((l) => l.id === id) ?? null;
  },

  async create(payload: NewLinkPayload): Promise<DevLink> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("links")
    .insert([
      {
        ...payload,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
},

  async delete(id: string) {
    write(read().filter((l) => l.id !== id));
  },
};
