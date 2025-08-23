package com.skincare;
import java.sql.Connection;

public class DBtest {

        public static void main(String[] args) {
            try {
                Connection conn = DBconnection.getConnection();
                if (conn != null) {
                    System.out.println("✅ Connected to MySQL database successfully!");
                    conn.close();
                } else {
                    System.out.println("❌ Failed to connect to MySQL database.");
                }
            } catch (Exception e) {
                System.out.println("❌ Error connecting to MySQL:");
                e.printStackTrace();
            }
        }
    }

