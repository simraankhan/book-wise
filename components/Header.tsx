"use client";

import { PathName } from "@/constants/path-name";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";

const Header = ({ session }: { session: Session | null }) => {
  const pathName = usePathname();
  return (
    <header className="mt-10 flex justify-between gap-5">
      <Link href={PathName.home}>
        <Image src={"/icons/logo.svg"} alt="Logo" width={40} height={40} />
      </Link>
      <ul className="flex flex-row items-center gap-8">
        <li>
          <Link
            href={PathName.library}
            className={cn(
              "text-base cursor-pointer capitalize",
              pathName === PathName.library
                ? "text-light-200"
                : "text-light-100"
            )}
          >
            Library
          </Link>
        </li>
        <li>
          <Link href={PathName.myProfile}>
            <Avatar>
              <AvatarFallback className="bg-light-100">
                {session?.user?.name ? getInitials(session?.user?.name) : "N/A"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
