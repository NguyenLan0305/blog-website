package com.example.blog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    // Khi bạn gõ localhost:8080/login trên trình duyệt
    @GetMapping("/login")
    public String showLoginPage() {
        return "login"; // Nó sẽ tìm đến templates/login.html
    }

    // Khi bạn gõ localhost:8080/register trên trình duyệt
    @GetMapping("/register")
    public String showRegisterPage() {
        return "register"; // Nó sẽ tìm đến templates/register.html
    }
    
    @GetMapping("/forgot-password")
public String forgotPassword() {
    return "forgot-password";
}
}