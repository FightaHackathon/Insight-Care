package com.skincare.model;

import java.time.LocalDateTime;

public class Clinic {
    private int id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String postCode;
    private String phone;
    private String email;
    private String openingHours;
    private String status; // active, inactive, maintenance
    private String imageUrl;
    private String popularTreatment;
    private String priceRange;
    private double rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public Clinic() {}

    public Clinic(String name, String description, String address, String city, String postCode, 
                  String phone, String email, String openingHours, String status) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.city = city;
        this.postCode = postCode;
        this.phone = phone;
        this.email = email;
        this.openingHours = openingHours;
        this.status = status;
        this.rating = 4.5; // Default rating
        this.priceRange = "$$"; // Default price range
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostCode() { return postCode; }
    public void setPostCode(String postCode) { this.postCode = postCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPopularTreatment() { return popularTreatment; }
    public void setPopularTreatment(String popularTreatment) { this.popularTreatment = popularTreatment; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public String getSlug() {
        return name.toLowerCase()
                   .replaceAll("[^a-z0-9\\s]", "")
                   .replaceAll("\\s+", "-")
                   .replaceAll("^-|-$", "");
    }

    public String getFullAddress() {
        return address + ", " + city + " " + postCode;
    }

    @Override
    public String toString() {
        return "Clinic{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", city='" + city + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
