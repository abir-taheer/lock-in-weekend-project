import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { PixelCanvas } from "./PixelCanvas";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Pixel Canvas</h2>
        <SignOutButton />
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Authenticated>
        <PixelCanvas />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center h-full gap-8 min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-primary mb-4">Pixel Canvas</h1>
            <p className="text-xl text-secondary">Sign in to start painting pixels!</p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
