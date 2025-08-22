package com.skincare.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }
    
    @GetMapping("/health")
    public String health() {
        return "forward:/index.html";
    }
    
    @GetMapping("/home")
    public String homeAlias() {
        return "forward:/index.html";
    }
}