import Head from "next/head";
import packageJson from "../package.json";
import { useEffect, useState } from "react";
import { logError, logInfo } from "../utils/logger";

export default function Home(props) {
  const { liff, liffError } = props;
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    if (liff) {
      logInfo('LIFF initialized:', {
        liffVersion: liff.getVersion()
      });
    }
    if (liffError) {
      logError('LIFF initialization failed:', {
        error: liffError
      });
    }
  }, [liff, liffError]);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      const data = await response.json();
      setHealthStatus(data.status);
    } catch (error) {
      console.error('Error checking health:', error);
      setHealthStatus('Error');
    }
  };

  return (
    <div>
      <Head>
        <title>LIFF Starter</title>
      </Head>
      <div className="home">
        <h1 className="home__title">
          Welcome to <br />
          <a
            className="home__title__link"
            href="https://developers.line.biz/en/docs/liff/overview/"
          >
            LIFF Starter!
          </a>
        </h1>
        <div className="home__badges">
          <span className="home__badges__badge badge--primary">
            LIFF Starter
          </span>
          <span className="home__badges__badge badge--secondary">nextjs</span>
          <span className="home__badges__badge badge--primary">
            {packageJson.version}
          </span>
          <a
            href="https://github.com/line/line-liff-v2-starter"
            target="_blank"
            rel="noreferrer"
            className="home__badges__badge badge--secondary"
          >
            GitHub
          </a>
        </div>
        <div className="home__buttons">
          <a
            href="https://developers.line.biz/en/docs/liff/developing-liff-apps/"
            target="_blank"
            rel="noreferrer"
            className="home__buttons__button button--primary"
          >
            LIFF Documentation
          </a>
          <a
            href="https://liff-playground.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="home__buttons__button button--tertiary"
          >
            LIFF Playground
          </a>
          <a
            href="https://developers.line.biz/console/"
            target="_blank"
            rel="noreferrer"
            className="home__buttons__button button--secondary"
          >
            LINE Developers Console
          </a>
          <button
            onClick={checkHealth}
            className="home__buttons__button button--primary"
          >
            Check Backend Health
          </button>
        </div>
        {healthStatus && (
          <div className="home__status">
            Backend Health Status: {healthStatus}
          </div>
        )}
      </div>
    </div>
  );
}