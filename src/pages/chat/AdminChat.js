import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import printFormatDate from "../../utils/printFormatDate";
import formatDate from "../../utils/formatDate";

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [reservationDetails, setReservationDetails] = useState({});
  const { reservationId } = useParams();
  const boxRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "reservationList", reservationId, "messages"),
        orderBy("timestamp")
      ),
      async (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
          };
        });
        setMessages(messagesData);
        messagesData.forEach((message) => {
          if (message.sender === "customer" && !message.checked) {
            const messageRef = doc(
              db,
              "reservationList",
              reservationId,
              "messages",
              message.id
            );
            updateDoc(messageRef, { checked: true });
          }
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [reservationId]);

  useEffect(() => {
    const getReservationDetails = async () => {
      const docRef = doc(db, "reservationList", reservationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReservationDetails(docSnap.data().reservationInfo);
      }
    };

    getReservationDetails();
  }, [reservationId]);

  useEffect(() => {
    boxRef.current.scrollTop =
      boxRef.current.scrollHeight - boxRef.current.clientHeight;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        sender: "admin",
        senderName: "철희네",
        content: newMessage,
        timestamp: new Date(),
        checked: false,
      };

      await addDoc(
        collection(db, "reservationList", reservationId, "messages"),
        message
      );

      await updateDoc(doc(db, "reservationList", reservationId), {
        lastMessageTime: new Date(),
      });

      setNewMessage("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 80px)",
      }}
    >
      <Card
        sx={{
          maxHeight: "230px",
          minHeight: "230px",
          m: 2,
        }}
      >
        <CardContent>
          <Typography variant="h4">
            {reservationDetails.userName} 고객님
          </Typography>
          <Typography variant="h5" gutterBottom>
            {reservationDetails.packageName}
          </Typography>
          <Typography>
            예약 시간: {printFormatDate(reservationDetails)}
          </Typography>
          <Typography>
            시작 날짜: {formatDate(reservationDetails.startDate)}
          </Typography>
          <Typography>
            종료 날짜: {formatDate(reservationDetails.endDate)}
          </Typography>
          <Typography>인원 수: {reservationDetails.people}명</Typography>
          <Typography>총 금액: {reservationDetails.totalPrice}원</Typography>
        </CardContent>
      </Card>
      <Box
        ref={boxRef}
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: "scroll",
          px: 2,
          "&::-webkit-scrollbar": {
            width: "0.5em",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.3)",
          },
        }}
      >
        {messages.map((message, index) => (
          <Grid
            key={index}
            container
            justifyContent={
              message.sender === "customer" ? "flex-start" : "flex-end"
            }
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            {message.sender === "customer" && (
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  {message.senderName}
                </Typography>
              </Grid>
            )}
            <Grid item>
              <Paper
                elevation={1}
                sx={{
                  maxWidth: "500px",
                  padding: "8px 16px",
                  backgroundColor:
                    message.sender === "customer" ? "grey.200" : "primary.main",
                }}
              >
                <Typography
                  variant="body1"
                  style={{
                    color: message.sender === "customer" ? "black" : "white",
                  }}
                >
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    color: message.sender === "customer" ? "black" : "white",
                  }}
                >
                  {printFormatDate(message)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ))}
      </Box>
      <Divider />
      <Box component="form" onSubmit={handleSendMessage} sx={{ mt: 1, px: 2 }}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={9}>
            <TextField
              id="message"
              label="메시지"
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              전송
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminChat;
