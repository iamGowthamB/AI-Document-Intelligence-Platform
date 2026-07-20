package com.enterprise.document.service;

import com.enterprise.document.dto.DepartmentDto;
import com.enterprise.document.entity.Department;
import com.enterprise.document.exception.BadRequestException;
import com.enterprise.document.exception.ResourceNotFoundException;
import com.enterprise.document.repository.DepartmentRepository;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public DepartmentDto createDepartment(Department department) {
        if (departmentRepository.findByName(department.getName()).isPresent()) {
            throw new BadRequestException("Department name already exists: " + department.getName());
        }
        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        
        departmentRepository.findByName(dto.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Department name already exists: " + dto.getName());
            }
        });

        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        if (!userRepository.findByDepartmentId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete department because it has registered users.");
        }
        departmentRepository.delete(department);
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentByIdDto(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        return mapToDto(dept);
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private DepartmentDto mapToDto(Department dept) {
        long count = userRepository.findByDepartmentId(dept.getId()).size();
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .memberCount(count)
                .build();
    }
}
