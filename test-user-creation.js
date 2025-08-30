const fetch = require('node-fetch');

async function testUserCreation() {
    const testUser = {
        name: "Test Healthcare Worker",
        email: "test.worker@example.com",
        phone: "123-456-7890",
        role: "healthcare_worker",
        profile: {
            employeeId: "EMP001",
            specialization: "Nursing",
            department: "Emergency",
            licenseNumber: "RN123456",
            certification: "BLS, ACLS",
            availableStart: "08:00:00",
            availableEnd: "20:00:00"
        },
        autoAssignShifts: true,
        autoAssignConfig: {
            maxShiftsPerWeek: 3,
            avoidConsecutiveShifts: true,
            respectAvailability: true,
            prioritizeUnderstaffed: true,
            assignToSameDepartment: true,
            lookAheadDays: 14,
            minRestHours: 12
        }
    };

    try {
        console.log("Testing user creation...");
        console.log("Request payload:", JSON.stringify(testUser, null, 2));
        
        const response = await fetch('http://localhost:3000/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const result = await response.json();
        
        console.log("Response status:", response.status);
        console.log("Response body:", JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log("✅ User creation successful!");
        } else {
            console.log("❌ User creation failed!");
        }
        
    } catch (error) {
        console.error("❌ Error testing user creation:", error.message);
    }
}

// Run the test
testUserCreation(); 