package com.bytesquad.CConnect.cconnectapp.cconnectcontroller;

import com.bytesquad.CConnect.cconnectapp.dtos.AppointmentDto;
import com.bytesquad.CConnect.cconnectapp.dtos.LoginDto;
import com.bytesquad.CConnect.cconnectapp.dtos.user.UserDto;
import com.bytesquad.CConnect.cconnectapp.service.AppointmentService;
import com.bytesquad.CConnect.cconnectapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointment")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public AppointmentDto login(@RequestBody AppointmentDto appointmentDto){
        return appointmentService.book(appointmentDto);
    }

    @GetMapping("user/{userId}")
    public List<AppointmentDto> getAllUsersAppointments(@PathVariable String userId){
        return appointmentService.getAllUserAppointments(userId);
    }

    @GetMapping(value = "doctor/{doctorId}")
    public List<AppointmentDto> getAppointmentsByDoctor(@PathVariable String doctorId){
        return appointmentService.getAppointmentsByDoctor(doctorId);
    }

    @DeleteMapping("/{appointmentId}")
    public void delete(@PathVariable String appointmentId){
         appointmentService.delete(appointmentId);
    }

}
