import { useEffect } from 'react';

const GoogleAd = () => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3617960560151760"
      data-ad-slot="7769562854"
      data-ad-format="auto"
      data-full-width-responsive="true"
    >
    </ins>
  );
};

export default GoogleAd;