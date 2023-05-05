import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  Container,
  CardActions,
  Grid,
  Button,
} from "@mui/material";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "@firebase/firestore";
import { db } from "../../firebase/config";
import formatDate from "../../utils/formatDate";
import printFormatDate from "../../utils/printFormatDate";

const PackageCard = styled(Card)`
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  transition: 0.3s;
  &:hover {
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.5);
  }
`;

const CardActionContainer = styled(CardActions)`
  display: flex;
  padding: 15px;
  // flex-direction: column;
  width: 100%;
`;

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      const reservationSnapshot = await getDocs(
        query(
          collection(db, "reservationList"),
          orderBy("lastMessageTime", "desc")
        )
      );

      const reservationData = reservationSnapshot.docs.map((doc) => ({
        ...doc.data().reservationInfo,
        lastMessageTime: doc.data().lastMessageTime,
        unreadMessages: 0,
      }));

      setReservations(reservationData);
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const unsubscribes = [];
    reservations.forEach((reservation) => {
      const { reservationId } = reservation;

      const unsubscribe = onSnapshot(
        query(
          collection(db, "reservationList", reservationId, "messages"),
          where("sender", "==", "customer"),
          where("checked", "==", false)
        ),
        (snapshot) => {
          const unreadMessagesData = snapshot.docs.map((doc) => doc.data());
          reservation.unreadMessages = unreadMessagesData.length;
          console.log(reservation.unreadMessages);
          setReservations([...reservations]);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <Box sx={{ pb: "30px" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ m: 3 }}>
        예약 내역
      </Typography>
      <Container>
        <Grid container spacing={4}>
          {reservations.map((reservation, index) => (
            <Grid key={index} item xs={12} sm={6} md={6}>
              <PackageCard elevation={4}>
                <CardActionArea
                  sx={{ p: 2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/package/${reservation.packageId}`);
                  }}
                >
                  <CardHeader
                    title={`${reservation.userName} 고객님`}
                    subheader={reservation.packageName}
                  />
                  <CardContent>
                    <Typography>
                      {`예약 시간: ${printFormatDate(reservation)}`}
                    </Typography>
                    <Typography>
                      시작 날짜: {formatDate(reservation.startDate)}
                    </Typography>
                    <Typography>
                      종료 날짜: {formatDate(reservation.endDate)}
                    </Typography>
                    <Typography>인원 수: {reservation.people}명</Typography>
                    <Typography>총 금액: {reservation.totalPrice}원</Typography>
                  </CardContent>
                </CardActionArea>
                <CardActionContainer>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mx: 2 }}
                    component={Link}
                    to={`/adminChat/${reservation.reservationId}`}
                  >
                    1:1 채팅하기
                  </Button>
                  <Typography variant="body2" color="red">
                    {reservation.unreadMessages > 0 &&
                      `읽지 않은 ${reservation.unreadMessages}개의 메시지가 있습니다.`}
                  </Typography>
                </CardActionContainer>
              </PackageCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminReservations;
