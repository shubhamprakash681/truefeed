"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-2 flex justify-between items-center shadow-sm">
      <p className="text-2xl font-bold">TrueFeed</p>

      {session && session.user && (
        <div>
          <Button onClick={() => signOut()}>Logout</Button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
