import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import styled from "@emotion/styled";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MuiAlert from "@mui/material/Alert";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Snackbar,
  Dialog,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Grid,
  TextField,
} from "@mui/material";
import { auth, db } from "../../firebase/config";
import useIsAdmin from "../../utils/useIsAdmin";

const PackageCard = styled(Card)`
  padding: 20px 20px 0 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #f8f8f8;
`;

const PackageDetailsContainer = styled.div`
  margin: 0 auto;
  padding: 20px;
`;

const ReservationForm = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const TravelPackageDetails = () => {
  const { packageId } = useParams();
  const [packageDetails, setPackageDetails] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [numPeople, setNumPeople] = useState(1);
  const [alertOpen, setAlertOpen] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (packageDetails) {
      setTotalPrice(packageDetails.price * numPeople);
    }
  }, [packageDetails, numPeople]);

  const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  useEffect(() => {
    const fetchPackageDetails = async () => {
      const packageRef = doc(db, "travelPackages", packageId);
      const packageSnapshot = await getDoc(packageRef);
      setPackageDetails({ id: packageSnapshot.id, ...packageSnapshot.data() });
    };

    fetchPackageDetails();
  }, [packageId]);

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };

  const handleNumPeopleChange = (event) => {
    setNumPeople(event.target.value);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleReservation = async () => {
    try {
      if (endDate < startDate) {
        setAlertOpen(true);
      } else {
        const reservationId = uuidv4();

        const reservation = {
          reservationId: reservationId,
          packageId: packageId,
          packageName: packageDetails.name,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
          price: packageDetails.price,
          city: packageDetails.city,
          totalPrice: totalPrice,
          people: numPeople,
          userName: currentUser.displayName,
          timestamp: new Date(),
        };

        let reservationListDoc = await getDoc(
          doc(db, "userReservations", currentUser.uid)
        );

        if (!reservationListDoc.exists()) {
          await setDoc(doc(db, "userReservations", currentUser.uid), {
            reservations: [],
          });
          reservationListDoc = await getDoc(
            doc(db, "userReservations", currentUser.uid)
          );
        }

        const reservations = reservationListDoc.data()["reservations"];
        reservations.push(reservation);

        await updateDoc(doc(db, "userReservations", currentUser.uid), {
          reservations: reservations,
        });

        await setDoc(doc(db, "reservationList", reservationId), {
          reservationInfo: reservation,
        });

        await addDoc(
          collection(db, "reservationList", reservationId, "messages"),
          {
            sender: "admin",
            senderName: "철희네",
            content: packageDetails.macroMessage,
            timestamp: new Date(),
            checked: false,
          }
        );

        await updateDoc(doc(db, "reservationList", reservationId), {
          lastMessageTime: new Date(),
        });

        setSuccessAlertOpen(true);
      }
    } catch (error) {
      console.error("Error handleReservation:", error);
    }
  };

  const handleCloseSuccessAlert = () => {
    setSuccessAlertOpen(false);
    navigate("/reservations");
  };

  return (
    <PackageDetailsContainer>
      {packageDetails ? (
        <>
          <PackageCard>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {packageDetails.name}
              </Typography>
              <Typography variant="h5">{packageDetails.city}</Typography>
              <Typography variant="body1" gutterBottom>
                {packageDetails.packageName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {packageDetails.description}
              </Typography>
              <Typography variant="h6">
                1인당 가격: {packageDetails.price}원
              </Typography>
            </CardContent>
          </PackageCard>
          {!isAdmin ? (
            <>
              <ReservationForm>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={1} sm={4} sx={{ mt: 2 }}>
                      <DatePicker
                        label="시작 날짜"
                        value={startDate}
                        onChange={handleStartDateChange}
                      />
                    </Grid>
                    <Grid item xs={1} sm={4} sx={{ mt: 2 }}>
                      <DatePicker
                        label="종료 날짜"
                        value={endDate}
                        onChange={handleEndDateChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1.5}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>인원 수</InputLabel>
                        <Select
                          value={numPeople}
                          onChange={handleNumPeopleChange}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <MenuItem key={num} value={num}>
                              {num}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                <Grid
                  container
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Grid item>
                    <Typography variant="h6" gutterBottom>
                      총 금액: {totalPrice}원
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleReservation}
                    >
                      예약하기
                    </Button>
                  </Grid>
                </Grid>
              </ReservationForm>
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <p>패키지 정보를 가져오는 중...</p>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <div>
          <Alert
            onClose={handleCloseAlert}
            severity="error"
            sx={{ width: "100%" }}
          >
            종료 날짜가 시작 날짜보다 빠릅니다. 날짜를 다시 선택해주세요.
          </Alert>
        </div>
      </Snackbar>

      <Dialog
        open={successAlertOpen}
        onClose={handleCloseSuccessAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>예약 성공</DialogTitle>
        <DialogContent>
          예약이 완료되었습니다. 확인을 누르면 나의 예약 내역 페이지로
          이동합니다.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessAlert} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </PackageDetailsContainer>
  );
};

export default TravelPackageDetails;
