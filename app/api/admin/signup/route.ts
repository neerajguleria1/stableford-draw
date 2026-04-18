import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, adminCode } = await req.json();

    if (!name || !email || !password || !adminCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (adminCode !== process.env.ADMIN_SIGNUP_CODE) {
      return NextResponse.json({ error: "Invalid admin code" }, { status: 403 });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "admin" },
    });

    if (error) throw error;

    await supabase.from("users_profiles").upsert({
      user_id: data.user.id,
      email,
      full_name: name,
      role: "admin",
    }, { onConflict: "user_id" });

    return NextResponse.json({ message: "Admin account created successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
