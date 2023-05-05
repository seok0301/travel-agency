import React, { useState } from "react";
import { auth } from "../../firebase/config";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Snackbar,
  Paper,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

const SignInContainer = styled(Grid)`
  height: calc(100vh - 80px);
`;

const SignInPaper = styled(Paper)`
  padding: 50px;
  border-radius: 16px;
`;

const StyledTypography = styled(Typography)`
  margin-bottom: 32px;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 16px;
  width: 100%;
`;

const SignInButton = styled(Button)`
  width: 300px;
  height: 40px;
`;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate("/");
    } catch (error) {
      setErrorMessage("이메일과 비밀번호를 다시 확인해주세요.");
      setOpen(true);
    }
  };

  return (
    <SignInContainer
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <SignInPaper elevation={12}>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <StyledTypography variant="h4">로그인</StyledTypography>
          </Grid>
          <form onSubmit={handleSubmit}>
            <Grid item>
              <StyledTextField
                label="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item>
              <StyledTextField
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item>
              <SignInButton type="submit" variant="contained">
                로그인
              </SignInButton>
            </Grid>
          </form>
        </Grid>
      </SignInPaper>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <div>
          <Alert onClose={handleClose} severity="error">
            {errorMessage}
          </Alert>
        </div>
      </Snackbar>
    </SignInContainer>
  );
};

export default SignIn;
