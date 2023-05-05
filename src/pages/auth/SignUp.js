import React, { useState } from "react";
import { auth } from "../../firebase/config";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from "@mui/material";
import styled from "@emotion/styled";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

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

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const navigate = useNavigate();

  const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorOpen(false);
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/signIn");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMessage("모든 항목을 채워주세요.");
      setErrorOpen(true);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("잘못된 이메일 형식입니다.");
      setErrorOpen(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자리 이상이여야 합니다.");
      setErrorOpen(true);
      return;
    }

    try {
      const { user } = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await auth.signOut();
      await user.updateProfile({ displayName: name });
      setSuccessOpen(true);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorOpen(true);
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
            <StyledTypography variant="h4">회원가입</StyledTypography>
          </Grid>
          <form onSubmit={handleSubmit}>
            <Grid item>
              <StyledTextField
                label="이름"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
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
                회원가입
              </SignInButton>
            </Grid>
          </form>
        </Grid>
      </SignInPaper>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <div>
          <Alert onClose={handleErrorClose} severity="error">
            {errorMessage}
          </Alert>
        </div>
      </Snackbar>
      <Dialog open={successOpen} onClose={handleSuccessClose}>
        <DialogTitle>회원가입</DialogTitle>
        <DialogContent>
          회원가입이 완료되었습니다. 로그인해주세요.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </SignInContainer>
  );
};

export default SignUp;
