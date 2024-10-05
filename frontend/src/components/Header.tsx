const Header = () => {
  const headContent = {
    title: "Particle Auth Core App",
    metaDescription: "Particle Auth Code demo in Next js",
    favicon: "/favicon.ico",
  };

  const mainHeading = {
    text: "Welcome to our website!"
  };

  const subHeading =
    "Super WEb appication using Ethora.com and Particle Network.";

  return (
    <>
      <header>
        <title>{headContent.title}</title>
        <meta name="description" content={headContent.metaDescription} />
        <link rel="icon" href={headContent.favicon} />
      </header>
      <h1 className="text-4xl mt-4 font-bold mb-12 text-center flex items-center justify-center">
        {mainHeading.text}
      </h1>
      <h2 className="text-xl font-bold mb-6">{subHeading}</h2>
    </>
  );
};

export default Header;
