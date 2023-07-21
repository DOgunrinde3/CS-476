import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {FormsModule, Validators} from '@angular/forms';
import {AlertController, IonicModule, ModalController, NavController, NavParams} from '@ionic/angular';
import {HeaderPage} from "../header/header.page";
import {DoctorModel} from "../../model/doctor.model";
import {AppointmentModel} from "../../model/appointment.model";
import {CalendarComponent, CalendarMode, NgCalendarModule} from "ionic7-calendar";
import {FooterPage} from "../footer/footer.page";
import {AppointmentService} from "../../services/appointment.service";
import {UserInformationService} from "../../services/user-information.service";
import {UserModel} from "../../model/User.model";
import {ConfirmAppointmentPage} from "../confirm-appointment/confirm-appointment.page";
import {ActivatedRoute, Router} from "@angular/router";
import {AppointmentStatusEnum} from "../../model/appointment-status.enum";
import * as moment from 'moment';
import {NotificationModel} from "../../model/notification.model";
import {NotificationService} from "../../services/notification.service";
import {Subscription} from "rxjs";
@Component({
  selector: 'app-book-appointment',
  templateUrl: './manage-appointment.page.html',
  styleUrls: ['./manage-appointment.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderPage, NgCalendarModule, FooterPage, DatePipe]
})
export class ManageAppointmentPage implements OnInit, OnDestroy {

  date: string;
  noAppointments = false;
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date(Date.now() + ( 3600 * 1000 * 24))
    ,

  };
  appointmentAvailable: boolean = false;
  selectedDate: string | null;
  selectedAppointment: AppointmentModel;
  formattedDate: any;
  subscriptionComplete = false;
  viewTitle: string;
  selectedTime: string | undefined;
  user: UserModel;
  userAppointments: AppointmentModel[];
  filteredUserAppointments: AppointmentModel[];
  appointmentTimeShifts: string[];
  appointment: AppointmentModel;
  loadingSubscription: Subscription[] =[];

  // @ts-ignore
  @ViewChild(CalendarComponent) myCal: CalendarComponent; eventSource;


  constructor(public navCtrl: NavController,
              public modalController: ModalController,
              private datePipe: DatePipe,
              private appointmentService: AppointmentService,
              private userService: UserInformationService,
              private router: Router,
              private route: ActivatedRoute,
              private alertController:AlertController,
              private notificationService: NotificationService

  ) {

  }

  ngOnInit(){
    this.appointmentTimeShifts = this.appointmentService.getAllAppointmentHours();
    if(this.route.snapshot.paramMap.get('date') === null ){
      return;
    }
    else{
     this.calendar.currentDate =  new Date (Date.parse(this.route.snapshot.paramMap.get('date') || '{}'));
    }
  }

  ionViewWillEnter(){
    this.loadingSubscription.push(this.userService.userInformation$.subscribe(user => {
      this.user = user;
      this.getUserAppointments(user?.userId);
    }))

  }


  update(appointment: AppointmentModel, status: AppointmentStatusEnum){
    this.selectedAppointment = appointment;
    appointment.appointmentStatus = status;
    this.loadingSubscription.push(this.appointmentService.update(appointment).subscribe((appointment) =>{
      this.selectedAppointment.appointmentStatus = appointment.appointmentStatus;
    }));

    let notificationModel: NotificationModel = {
      id:null,
      appointment: appointment,
      notifiedFromId: this.user.userId,
      notifiedUserId: appointment.doctor,
    }

    this.loadingSubscription.push(this.notificationService.updateNotification(notificationModel, true).subscribe( ));

  }


  onDateSelected(date) {
    this.selectedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.formattedDate = this.datePipe.transform(this.selectedDate, 'mediumDate');
    this.filteredUserAppointments = this.userAppointments?.filter( appointment => appointment.appointmentDate === this.selectedDate);

    if (this.filteredUserAppointments?.length !== 0){
      this.noAppointments = true;
    }
    else{
      this.noAppointments = false;

    }

  }

  getColour(status:AppointmentStatusEnum){

    if(status === AppointmentStatusEnum.PENDING){
      return "warning";
    }
    else if(status === AppointmentStatusEnum.CONFIRMED){
      return "success";
    }
    else if(status === AppointmentStatusEnum.CANCELLED){
      return "danger";
    }

    return "primary";
  }
  getUserAppointments(userId: string){
    this.appointmentService.getUserAppointments(userId)
      .subscribe( (userAppointments)=>
        {
          this.userAppointments = userAppointments;
          this.eventSource = [];
          userAppointments.forEach((appointment)=>{
            const date = moment(appointment.appointmentDate, 'YYYY-MM-DD').toDate();
            this.eventSource?.push({
              title: appointment.appointmentType,
              startTime: date,
              endTime: date,
              allDay: false
            });
          })
          this.onDateSelected(this.calendar.currentDate);
          this.subscriptionComplete = true;

        }
      )

  }




  next() {
    this.myCal.slideNext();
  }

  back() {
    this.myCal.slidePrev();
  }
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  routeToBook(){
    let date = this.datePipe.transform(this.selectedDate);
    this.router.navigate(['/book', {date: date}]);
  }


  private openConfirmatModal(selectedDate: string, selectedTime: string) {


    this.appointment = {
      id: null,
      doctor: null,
      patient: this.user.userId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      appointmentType: "",
      appointmentStatus: AppointmentStatusEnum.PENDING
    };
     this.openModal(this.appointment)

    // confirmModal.onDidDismiss((data) => {
    //   if (data.confirm) {
    //     this.navCtrl.push(PageBookAppointmentConfirmationDetails, appointment);
    //   }
    // });
  }

  async openModal(appointment) {


    const modal = await this.modalController.create({
      component: ConfirmAppointmentPage,
      componentProps: {
       appointment: appointment
      },
      mode: "ios"
    });
    modal.present();



  }



  async showConfirmationModal(appointment, status) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            this.update(appointment, status);
            alert.dismiss();
            // Place your logic here for the confirmed action
          }
        }
      ]
    });

    await alert.present();
  }

  markDisabled = (date: Date) => {
    var current = new Date();
    return date < current;
  };
  protected readonly AppointmentStatusEnum = AppointmentStatusEnum;

  ngOnDestroy(){
    this.loadingSubscription.forEach(s => s.unsubscribe());
  }
}
