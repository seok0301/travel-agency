import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
} from "@mui/material";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { query, collection, where, onSnapshot } from "firebase/firestore";
import formatDate from "../../utils/formatDate";
import { onAuthStateChanged } from "firebase/auth";
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

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchReservations = async () => {
          const userUid = auth.currentUser.uid;
          const reservationListRef = doc(db, "userReservations", userUid);
          const reservationListSnapshot = await getDoc(reservationListRef);
          const data = reservationListSnapshot.exists()
            ? reservationListSnapshot.data().reservations
            : [];
          setReservations(data);

          const reservationsData = await Promise.all(
            data.map(async (reservation) => {
              const { reservationId } = reservation;

              const unreadMessagesSnapshot = await getDocs(
                query(
                  collection(db, "reservationList", reservationId, "messages"),
                  where("sender", "==", "admin"),
                  where("checked", "==", false)
                )
              );

              const unreadMessagesData = unreadMessagesSnapshot.docs.map(
                (doc) => doc.data()
              );
              reservation.unreadMessages = unreadMessagesData.length;
              return reservation;
            })
          );

          setReservations(reservationsData);
        };
        fetchReservations();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribes = [];
    reservations.forEach((reservation) => {
      const { reservationId } = reservation;

      const unsubscribe = onSnapshot(
        query(
          collection(db, "reservationList", reservationId, "messages"),
          where("sender", "==", "admin"),
          where("checked", "==", false)
        ),
        (snapshot) => {
          console.log(reservationId);
          const unreadMessagesData = snapshot.docs.map((doc) => doc.data());
          const updatedReservations = reservations.map((res) => {
            if (res.reservationId === reservationId) {
              return {
                ...res,
                unreadMessages: unreadMessagesData.length,
              };
            }
            return res;
          });
          setReservations(updatedReservations);
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
          {reservations.map((reservation, index) => {
            return (
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
                      title={`${reservation.packageName}`}
                      subheader={`예약 시간: ${printFormatDate(reservation)}`}
                    />
                    <CardContent>
                      <Typography>
                        시작 날짜: {formatDate(reservation.startDate)}
                      </Typography>
                      <Typography>
                        종료 날짜: {formatDate(reservation.endDate)}
                      </Typography>
                      <Typography>인원 수: {reservation.people}</Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActionContainer>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mx: 2 }}
                      component={Link}
                      to={`/chat/${reservation.reservationId}`}
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
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default Reservation;
