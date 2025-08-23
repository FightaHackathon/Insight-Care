package com.skincare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBconnection {
    // Default XAMPP MySQL port 3306 with robust params
    // - useSSL=false to avoid SSL handshake on local
    // - allowPublicKeyRetrieval=true for caching-sha2-password
    // - serverTimezone=UTC to avoid timezone issues
    // - characterEncoding=UTF-8 for proper unicode
    private static final String URL = "jdbc:mysql://localhost:3306/skin_care?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static final String USER = "root";
    private static final String PASSWORD = ""; // set here if your root has a password

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
