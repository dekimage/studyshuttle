"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobxStore from "../app/mobx";
import { observer } from "mobx-react-lite";
import Loader from "../app/_components/Loader";

// Higher-Order Component for authentication
const withAuth = (WrappedComponent) => {
  const AuthComponent = observer((props) => {
    const router = useRouter();
    const { user, loading } = MobxStore;

    useEffect(() => {
      if (!loading && !user) {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    }, [loading, user, router]);

    // Show loader when loading state is true
    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader />
        </div>
      );
    }

    if (loading) {
      return <Loader />;
    }

    // After loading, if the user is not authenticated, show a message and redirect

    // If user is authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  });

  return AuthComponent;
};

export default withAuth;
