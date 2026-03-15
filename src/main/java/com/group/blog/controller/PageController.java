package com.group.blog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String homePage() {
        return "/public/home-page";  // → templates/public/home-page.html
    }

    @GetMapping("/login")
    public String loginPage() {
        return "public/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "public/register";
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "public/forgot-password";
    }
}