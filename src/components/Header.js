import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { auth } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "@emotion/styled";
import useIsAdmin from "../utils/useIsAdmin";
import { useNavigate, Link } from "react-router-dom";

const StyledLogo = styled(Typography)`
  && {
    text-decoration: none;
    color: inherit;
    font-size: 25px;
    font-weight: 500;
    margin-right: auto;
  }
`;

const StyledRight = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  margin-left: 12px;
`;

const Header = () => {
  const [user] = useAuthState(auth);
  const isAdmin = useIsAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddPackageClick = () => {
    navigate("/addPackage");
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    navigate("/");
    setIsDialogOpen(true);
    await auth.signOut();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <StyledLogo component={Link} to="/">
          철희네 여행사
        </StyledLogo>

        <StyledRight>
          {user && <Typography>{user.displayName}님 반갑습니다.</Typography>}

          {!user && (
            <>
              <StyledButton color="inherit" component={Link} to="/signIn">
                로그인
              </StyledButton>
              <StyledButton color="inherit" component={Link} to="/signUp">
                회원가입
              </StyledButton>
              <StyledButton color="inherit" component={Link} to="/">
                패키지 목록
              </StyledButton>
            </>
          )}

          {isAdmin && (
            <>
              <StyledButton color="inherit" onClick={handleAddPackageClick}>
                여행 패키지 추가
              </StyledButton>
              <StyledButton
                color="inherit"
                component={Link}
                to="/adminReservations"
              >
                예약 내역
              </StyledButton>
              <StyledButton component={Link} to="/" color="inherit">
                패키지 목록
              </StyledButton>
              <StyledButton color="inherit" onClick={handleLogout}>
                로그아웃
              </StyledButton>
            </>
          )}
          {user && !isAdmin && (
            <>
              <StyledButton color="inherit" component={Link} to="/reservations">
                예약 내역
              </StyledButton>
              <StyledButton component={Link} to="/" color="inherit">
                패키지 목록
              </StyledButton>
              <StyledButton color="inherit" onClick={handleLogout}>
                로그아웃
              </StyledButton>
            </>
          )}
        </StyledRight>
      </Toolbar>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>로그아웃</DialogTitle>
        <DialogContent>로그아웃 되었습니다.</DialogContent>
        <DialogActions>
          <StyledButton color="primary" onClick={handleDialogClose}>
            확인
          </StyledButton>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;
