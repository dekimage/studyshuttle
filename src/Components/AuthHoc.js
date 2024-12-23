"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobxStore from "../app/mobx";
import { observer } from "mobx-react-lite";
import Loader from "../app/_components/Loader";
import { db } from "../app/firebase";
import { toJS } from "mobx";

const withAuth = (WrappedComponent) => {
  const AuthComponent = observer((props) => {
    // const router = useRouter();
    // const { user, loading } = MobxStore;
    // const [verified, setVerified] = useState(false);
    // console.log(11, toJS(user));

    // useEffect(() => {
    //   const checkEmailVerification = async () => {
    //     console.log(user);
    //     if (user) {
    //       // Fetch emailVerified status from Firestore
    //       // const userDoc = await db.collection("users").doc(user.uid).get();
    //       // const userData = userDoc.data();

    //       if (user && user.emailVerified) {
    //         setVerified(true);
    //       } else {
    //         router.push("/verify-email");
    //       }
    //     }
    //   };

    //   if (!loading) {
    //     checkEmailVerification();
    //   }
    // }, [loading, user, router]);

    // if (loading || !verified) {
    //   return <Loader />;
    // }

    return <WrappedComponent {...props} />;
  });

  return AuthComponent;
};

export default withAuth;
