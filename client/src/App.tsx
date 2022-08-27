import { Container, CssBaseline, ThemeProvider } from "@mui/material";

import theme from './theme'
import Main from "./components/Main";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Main />
      </Container>
    </ThemeProvider>
  );
}

export default App;
