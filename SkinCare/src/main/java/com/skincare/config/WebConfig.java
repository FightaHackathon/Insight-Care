package com.skincare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        System.out.println("🔧 Configuring static resource handlers...");

        // Serve all static resources from classpath:/static/
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);

        // Handle images specifically
        registry.addResourceHandler("/Pics/**")
                .addResourceLocations("classpath:/static/Pics/")
                .setCachePeriod(86400);

        System.out.println("✅ Static resource handlers configured successfully");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        System.out.println("🔧 Configuring CORS mappings...");

        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);

        System.out.println("✅ CORS mappings configured successfully");
    }
}