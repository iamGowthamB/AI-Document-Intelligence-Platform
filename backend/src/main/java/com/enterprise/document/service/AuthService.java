package com.enterprise.document.service;

import com.enterprise.document.config.JwtService;
import com.enterprise.document.dto.ChangePasswordRequest;
import com.enterprise.document.dto.LoginRequest;
import com.enterprise.document.dto.LoginResponse;
import com.enterprise.document.entity.User;
import com.enterprise.document.exception.BadRequestException;
import com.enterprise.document.exception.ResourceNotFoundException;
import com.enterprise.document.exception.UnauthorizedException;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private final Map<String, String> resetTokens = new HashMap<>();

    public LoginResponse authenticate(LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
            
            User user = (User) auth.getPrincipal();
            if (!user.isActive()) {
                throw new UnauthorizedException("User account is inactive. Please contact the administrator.");
            }
            
            String token = jwtService.generateToken(user);
            
            auditLogService.log(user, "LOGIN", "Successfully logged in from application");

            return LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                    .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : "None")
                    .build();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid username or password");
        }
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogService.log(user, "CHANGE_PASSWORD", "Successfully changed own password");
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));
        
        String code = String.format("%08d", (int) (Math.random() * 100000000));
        resetTokens.put(email, code);
        
        auditLogService.log(user, "FORGOT_PASSWORD_REQUEST", "Requested temporary password reset token");
        System.out.println(">>> PASSWORD RESET TOKEN FOR " + email + " IS: " + code);
        return code;
    }

    @Transactional
    public void resetPassword(String email, String tempToken, String newPassword) {
        String savedToken = resetTokens.get(email);
        if (savedToken == null || !savedToken.equals(tempToken)) {
            throw new BadRequestException("Invalid or expired password reset token.");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        resetTokens.remove(email);
        auditLogService.log(user, "RESET_PASSWORD_COMPLETE", "Successfully reset password using token");
    }
}
