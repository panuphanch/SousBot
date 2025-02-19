import "../styles/globals.css";
import { useState, useEffect } from "react";
import liff from "@line/liff";
import { useRouter } from "next/router";
import { logInfo, logError } from "../utils/logger";

function MyApp({ Component, pageProps }) {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  const router = useRouter();

  // Execute liff.init() when the app is initialized
  useEffect(() => {
    const initLiff = async () => {
      await logInfo("LIFF Starter: Initializing LIFF SDK...");
      try {
        await liff.init({ liffId: process.env.LIFF_ID });
        await logInfo("LIFF Starter: LIFF SDK initialized");
        setLiffObject(liff);
      
        if (
          router.pathname === "/" &&
          window.location.href.includes("liff.state")
        ) {
          router.replace("/register");
        }
      }catch (error) {
        await logError("LIFF Starter: LIFF SDK initialization failed", {
          error: error,
        });
        if (!process.env.liffId) {
          await logInfo(
            "LIFF Starter: Please make sure that you provided `LIFF_ID` as an environmental variable."
          );
        }
        setLiffError(error.toString());
      }
    };

    initLiff();
  }, [router]);

  // Provide `liff` object and `liffError` object
  // to page component as property
  pageProps.liff = liffObject;
  pageProps.liffError = liffError;
  return <Component {...pageProps} />;
}

export default MyApp;
