package com.project1.smart_diary.service.ResetPassword;


import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.exception.ApplicationException;
import com.project1.smart_diary.exception.ErrorCode;
import com.project1.smart_diary.repository.UserRepository;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;
    @NonFinal
    @Value("${app.ngrok.fontend-url-public}")
    protected String Fontend_Url_public;

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
    public void checkMail(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if(user == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }
    }
    public void sendResetPasswordEmail(String to, String token) {
        String resetLink = Fontend_Url_public + "/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Đặt lại mật khẩu Moodiary");
        message.setText("Nhấn vào link để đặt lại mật khẩu: " + resetLink
                + "\nLink này có hiệu lực trong 10 phút.");
        mailSender.send(message);
    }
}