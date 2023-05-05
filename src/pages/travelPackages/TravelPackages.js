import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";

const PackageCard = styled(Card)`
  margin: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PackageCardContent = styled(CardContent)`
  background-color: #f8f8f8;
  padding: 16px;
  height: 100%;
`;

const PackageList = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const TravelPackages = () => {
  const [packages, setPackages] = useState([]);
  const [user] = useAuthState(auth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const packagesRef = collection(db, "travelPackages");
      const snapshot = await getDocs(packagesRef);
      const packagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPackages(packagesData);
    };

    fetchData();
  }, []);

  const handleItemClick = (id) => {
    if (!user) {
      setIsDialogOpen(true);
    } else {
      navigate(`/package/${id}`);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <PackageList>
      {packages.map((pkg) => (
        <div key={pkg.id}>
          <PackageCard elevation={4}>
            <CardActionArea
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(pkg.id);
              }}
            >
              <PackageCardContent>
                <CardContent>
                  <Typography gutterBottom variant="h4" component="div">
                    {pkg.name}
                  </Typography>
                  <Typography gutterBottom variant="h5" color="text.secondary">
                    {pkg.city}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color="text.secondary"
                  >
                    {pkg.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    가격: {pkg.price}원
                  </Typography>
                </CardContent>
              </PackageCardContent>
            </CardActionArea>
          </PackageCard>
        </div>
      ))}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>로그인</DialogTitle>
        <DialogContent>로그인 후 이용 가능합니다.</DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>취소</Button>
          <Button color="primary" component={Link} to="/signIn">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </PackageList>
  );
};

export default TravelPackages;
