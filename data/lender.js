export const lenderData = {
    "dashboardOverview": {
      "totalAmountLent": 1250000,
      "totalActiveLoans": 120,
      "totalBorrowers": 350,
      "totalInterestEarned": 320000,
      "defaultRate": 5,
      "averageLoanAmount": 10500,
      "recentActivity": {
        "recentLoansIssued": [
          {
            "loanID": 1001,
            "amount": 15000,
            "borrower": "John Doe",
            "date": "2024-06-25"
          },
          {
            "loanID": 1002,
            "amount": 8000,
            "borrower": "Jane Smith",
            "date": "2024-06-24"
          },
          {
            "loanID": 1003,
            "amount": 12500,
            "borrower": "Bob Johnson",
            "date": "2024-06-23"
          }
        ],
        "recentPaymentsReceived": [
          {
            "paymentID": 2001,
            "amount": 1200,
            "borrower": "John Doe",
            "date": "2024-06-26"
          },
          {
            "paymentID": 2002,
            "amount": 900,
            "borrower": "Jane Smith",
            "date": "2024-06-25"
          },
          {
            "paymentID": 2003,
            "amount": 1100,
            "borrower": "Bob Johnson",
            "date": "2024-06-24"
          }
        ],
        "recentBorrowerRegistrations": [
          {
            "borrowerID": 3001,
            "name": "Alice Brown",
            "date": "2024-06-27"
          },
          {
            "borrowerID": 3002,
            "name": "Charlie Davis",
            "date": "2024-06-26"
          },
          {
            "borrowerID": 3003,
            "name": "Eve White",
            "date": "2024-06-25"
          }
        ]
      },
      "graphicalInsights": {
        "loanIssuanceTrends": {
          "monthly": {
            "January": 100000,
            "February": 150000,
            "March": 130000,
            "April": 120000,
            "May": 160000,
            "June": 170000
          }
        },
        "paymentCollectionTrends": {
          "monthly": {
            "January": 90000,
            "February": 110000,
            "March": 120000,
            "April": 105000,
            "May": 140000,
            "June": 150000
          }
        },
        "defaultRateTrends": {
          "quarterly": {
            "Q1": 4,
            "Q2": 5,
            "Q3": 6,
            "Q4": 5
          }
        },
        "interestEarnedTrends": {
          "yearly": {
            "2021": 80000,
            "2022": 90000,
            "2023": 100000,
            "2024": 120000
          }
        }
      }
    },
    "borrowerManagement": {
      "borrowerList": [
        {
          "borrowerName": "John Doe",
          "email": "john.doe@example.com",
          "contactNumber": "123-456-7890",
          "loanAmount": 15000,
          "loanStatus": "Active",
          "dateOfLoanIssuance": "2024-06-01",
          "cibilScore": 750
        },
        {
          "borrowerName": "Jane Smith",
          "email": "jane.smith@example.com",
          "contactNumber": "234-567-8901",
          "loanAmount": 8000,
          "loanStatus": "Completed",
          "dateOfLoanIssuance": "2023-11-15",
          "cibilScore": 720
        },
        {
          "borrowerName": "Bob Johnson",
          "email": "bob.johnson@example.com",
          "contactNumber": "345-678-9012",
          "loanAmount": 12500,
          "loanStatus": "Defaulted",
          "dateOfLoanIssuance": "2022-05-10",
          "cibilScore": 680
        }
      ],
      "borrowerDetails": {
        "personalInformation": {
          "name": "John Doe",
          "age": 35,
          "address": "123 Main St, Springfield, IL"
        },
        "loanInformation": {
          "amount": 15000,
          "term": 36,
          "interestRate": 7.5
        },
        "repaymentSchedule": {
          "monthlyPayment": 450,
          "nextPaymentDue": "2024-07-10"
        },
        "paymentHistory": [
          {
            "date": "2024-06-10",
            "amount": 450
          },
          {
            "date": "2024-05-10",
            "amount": 450
          },
          {
            "date": "2024-04-10",
            "amount": 450
          }
        ],
        "cibilScore": 750,
        "documents": {
          "idProof": "Passport",
          "addressProof": "Utility Bill",
          "incomeProof": "Salary Slip"
        }
      }
    }
  }