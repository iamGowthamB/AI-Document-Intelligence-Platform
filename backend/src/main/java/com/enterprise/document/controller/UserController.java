package com.enterprise.document.controller;

import com.enterprise.document.dto.UserDto;
import com.enterprise.document.entity.User;
import com.enterprise.document.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @RequestBody User user,
            @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(userService.createUser(user, departmentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto userDto
    ) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDto> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, active));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<UserDto>> getUsersByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(userService.getUsersByDepartment(deptId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserByIdDto(id));
    }
}
