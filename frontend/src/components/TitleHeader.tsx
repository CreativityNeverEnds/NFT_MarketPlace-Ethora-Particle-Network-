const TitleHeader = () => {
  const headContent = {
    title: "Particle Auth Core App",
    metaDescription: "Particle Auth Code demo in Next js",
    favicon: "/favicon.ico",
  };

  const mainHeading = {
    text: "Welcome to our website!"
  };

  const subHeading =
    "Super Web appication using Ethora.com and Particle Network.";

  return (
    <>
      <header>
        <title>{headContent.title}</title>
        <meta name="description" content={headContent.metaDescription} />
        <link rel="icon" href={headContent.favicon} />
      </header>
      <h1 className="text-4xl mt-12 font-bold mb-3 text-center flex items-center justify-center p-3">
        {mainHeading.text}
      </h1>
      <h2 className="text-xl font-bold mb-3 p-4">{subHeading}</h2>
    </>
  );
};

export default TitleHeader;
