package com.enterprise.document.config;

import com.enterprise.document.entity.Department;
import com.enterprise.document.entity.Role;
import com.enterprise.document.entity.User;
import com.enterprise.document.repository.DepartmentRepository;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding default database records...");

            Department adminDept = Department.builder().name("Administration").description("System Admin Department").build();
            Department engDept = Department.builder().name("Engineering").description("Product Development & Software Engineering").build();
            Department legalDept = Department.builder().name("Legal").description("Regulatory and Legal Compliance").build();
            Department hrDept = Department.builder().name("Human Resources").description("Talent Management & Operations").build();
            Department financeDept = Department.builder().name("Finance").description("Budgeting, Accounting & Payroll").build();

            departmentRepository.saveAll(List.of(adminDept, engDept, legalDept, hrDept, financeDept));

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .email("admin@enterprise.com")
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .department(adminDept)
                    .active(true)
                    .build();
            userRepository.save(admin);

            User engManager = User.builder()
                    .username("manager_eng")
                    .password(passwordEncoder.encode("Manager@123"))
                    .email("manager.eng@enterprise.com")
                    .fullName("Engineering Director")
                    .role(Role.MANAGER)
                    .department(engDept)
                    .active(true)
                    .build();
            User legalManager = User.builder()
                    .username("manager_legal")
                    .password(passwordEncoder.encode("Manager@123"))
                    .email("manager.legal@enterprise.com")
                    .fullName("General Counsel")
                    .role(Role.MANAGER)
                    .department(legalDept)
                    .active(true)
                    .build();
            userRepository.saveAll(List.of(engManager, legalManager));

            User engEmp1 = User.builder()
                    .username("employee_eng1")
                    .password(passwordEncoder.encode("Employee@123"))
                    .email("emp.eng1@enterprise.com")
                    .fullName("Senior Engineer")
                    .role(Role.EMPLOYEE)
                    .department(engDept)
                    .active(true)
                    .build();
            User engEmp2 = User.builder()
                    .username("employee_eng2")
                    .password(passwordEncoder.encode("Employee@123"))
                    .email("emp.eng2@enterprise.com")
                    .fullName("QA Analyst")
                    .role(Role.EMPLOYEE)
                    .department(engDept)
                    .active(true)
                    .build();
            User legalEmp = User.builder()
                    .username("employee_legal1")
                    .password(passwordEncoder.encode("Employee@123"))
                    .email("emp.legal1@enterprise.com")
                    .fullName("Legal Associate")
                    .role(Role.EMPLOYEE)
                    .department(legalDept)
                    .active(true)
                    .build();
            userRepository.saveAll(List.of(engEmp1, engEmp2, legalEmp));

            System.out.println("Database seeding completed successfully.");
        }
    }
}
