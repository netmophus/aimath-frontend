// import React from "react";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import { Container } from "@mui/material";

// const PageLayout = ({ children }) => {
//   return (
//     <>
//       <Navbar />
//       <Container maxWidth="md" sx={{ minHeight: "80vh", mt: 4 }}>
//         {children}
//       </Container>
//       <Footer />
//     </>
//   );
// };

// export default PageLayout;



import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Box } from "@mui/material";

const PageLayout = ({ children }) => {
  return (
    <Box sx={{ minHeight: "100vh", display: "block" }}>
      <Navbar />

      {/* Conteneur principal du contenu */}
      <Box>
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default PageLayout;
