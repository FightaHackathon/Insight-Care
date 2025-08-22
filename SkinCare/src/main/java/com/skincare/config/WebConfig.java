package com.skincare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        System.out.println("🔧 Configuring static resource handlers...");
        
        // Serve static resources with specific patterns to avoid conflicts
        registry.addResourceHandler("/css/**", "/js/**", "/images/**", "/*.html", "/*.css", "/*.js")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
                
        // Handle images specifically  
        registry.addResourceHandler("/Pics/**")
                .addResourceLocations("classpath:/static/Pics/")
                .setCachePeriod(86400);
                
        System.out.println("✅ Static resource handlers configured successfully");
    }
}