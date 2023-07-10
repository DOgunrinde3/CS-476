import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {LoginModel} from "../model/Login.model";
import {UserModel} from "../model/User.model";
import {AppointmentModel} from "../model/appointment.model";

const BASE_URI = 'http://localhost:8080/api/v1/appointment';


const appointmentHours = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM'
];
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // @ts-ignore
  constructor(private http: HttpClient) {
  }

  getAllAppointmentHours(){
    return appointmentHours;
  }

  getUserAppointments(userId: string): Observable<AppointmentModel[]>{
    return this.http.get<AppointmentModel[]>(`${BASE_URI}/user/${userId}`);
  }

  bookAppointment(appointmentDetails: AppointmentModel): Observable<AppointmentModel>{
    return this.http.post<AppointmentModel>(`${BASE_URI}/book`, appointmentDetails);

  }

  delete(appointmentId: String): void{
     this.http.delete(`${BASE_URI}/${appointmentId}`);
  }

  getAppointmentsByDoctor(doctorId: string): Observable<AppointmentModel[]>{
    return this.http.get<AppointmentModel[]>(`${BASE_URI}/doctor/${doctorId}`);
  }


  // getDoctorAvailableAppointmentHours(){
  //   return appointmentHours;
  // }




}






