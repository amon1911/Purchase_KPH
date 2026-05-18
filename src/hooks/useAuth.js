import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { md5 } from "../lib/crypto";

const STORAGE_KEY = "kph_current_user";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลด user จาก localStorage ตอนเริ่ม
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (userId, pin) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      throw new Error("ไม่พบผู้ใช้");
    }

    if (data.pin_hash !== md5(pin)) {
      throw new Error("รหัส PIN ไม่ถูกต้อง");
    }

    // เก็บใน state + localStorage (ไม่เก็บ pin_hash)
    const { pin_hash, ...userWithoutPin } = data;
    setCurrentUser(userWithoutPin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPin));
    return userWithoutPin;
  };

  const register = async ({ name, role, pin }) => {
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        role,
        pin_hash: md5(pin),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { currentUser, loading, login, register, logout };
}
