package com.enterprise.document.service;

import com.enterprise.document.dto.UserDto;
import com.enterprise.document.entity.Department;
import com.enterprise.document.entity.Role;
import com.enterprise.document.entity.User;
import com.enterprise.document.exception.BadRequestException;
import com.enterprise.document.exception.ResourceNotFoundException;
import com.enterprise.document.repository.DepartmentRepository;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto createUser(User user, Long departmentId) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new BadRequestException("Username already exists: " + user.getUsername());
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists: " + user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + departmentId));
            user.setDepartment(dept);
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setEmail(userDto.getEmail());
        user.setFullName(userDto.getFullName());
        user.setRole(Role.valueOf(userDto.getRole().toUpperCase()));

        if (userDto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(userDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + userDto.getDepartmentId()));
            user.setDepartment(dept);
        } else {
            user.setDepartment(null);
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(active);
        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserByIdDto(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToDto(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : "None")
                .active(user.isActive())
                .build();
    }
}
