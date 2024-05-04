"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-2 flex justify-between items-center shadow-sm">
      <p className="select-none text-2xl font-bold">TrueFeed</p>

      {session && session.user ? (
        <div>
          <Button onClick={() => signOut()}>Logout</Button>
        </div>
      ) : (
        <div>
          <Link href={"/login"}>
            <Button variant={"outline"}>Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
