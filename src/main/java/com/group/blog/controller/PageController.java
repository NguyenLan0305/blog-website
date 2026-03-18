package com.group.blog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String homePage() {
        return "public/home-page";
    }

    @GetMapping("/home")
    public String home() {
        return "public/home-page";
    }

//    @GetMapping("/about")
//    public String aboutPage() {
//        return "public/about";
//    }

//    @GetMapping("/contact")
//    public String contactPage() {
//        return "public/contact";
//    }
}