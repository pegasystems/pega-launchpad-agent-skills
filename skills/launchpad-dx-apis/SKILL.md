---
name: launchpad-dx-apis
description: Explains how to use the Create Case DX API, including scalar content payloads, reference fields, allowed fields, and when to use this pattern.
tags: [launchpad, dx api, cases, create, rest. yaml, integration]
---

## Launchpad data model

Launchpad has Applications and each Application has Workflow or Data that will hold information about the lifecycle and the data model.
Launchpad provides COnstellation UI to create and run these workflows and Data. In some use cases we sometimes might have to create cases from outside using a Rest service in Launchpad. Or let us say a step in a workflow is to be completed by an external system then DXAPIs are the way.
DX APIs are called so as these are Digital Experience APIs as they are like Rest endpoints which give you data and alos provide view meta information so you can display the object in an external system using the view meta data.
For the context of this skill we will focus only on the DX APIS aspect of what types of API do we have and how can be use them.

## Type of DXAPIs

We have DX APIs for the following:
1. Create Case or Data object on Launchpad
2. Get the Case/Data information of an object
3. Perform action on a particular workflow/case.
4. Get a list of Objects by passing some filter criteria
5. Get additional content of the application like Attachments. 


## Authentication

Launchpad support OAuth 2.0 authenitcation to invoke these DXAPIs.
For anyone to invoke the DX APIs we need to have a Client Registration rule created in the Subscriber environment of Launchpad. When this Client Registration is created there will be an option to provide the Persona who will be using this Client Registration.
So when any DXAPI is invoked with this credentials the Access Role and Privileges for this DXAPI will be determined by the Persona provided in the Client Registration. So it is very important to choose the right Persona while creating the Client Registration as this will determine what all DX APIs can be invoked using this Client Registration.
The external system or team before proceeding will have to ask the team who is hosting the Launchpad environment to share the following 4 things:
1. Application URL
2. AccessTokenURL
3. ClientID
4. Client Secret

Once these are obtained we can build a system to talk to the launchpad application using the above details.
AccessToken URL can be used to for the authentication and the Application URL can be used to invoke the DXAPIs.

## Create Case DX API – scalar content

Use this pattern when an external system, needs to **create a new case or Data object** by sending data to Launchpad.

### Create a Case
Method: POST
Endpoint: https://<appURL>/dx/api/application/v2/cases
Request:
  Body:
  {
    "caseTypeID": "ExpenseRequest",
    "content": {
      "ExpenseeRaisedBy":"John Doe",
      "Name":"Expense Request for individual Name",
      "Category":"Travel",
      "Expenses":
       { 
        {
            "TravelType":"Air",
            "Amount":1000$
        },
        {
            "TravelType":"Cab"
            "Amount":100$
        }
      },
      "TotalAmount":1100$,
      "Team":"Team A"
      "ReasonforExpense":"Had to attend a conference in another city"
    }
  }
Response:
  {
    "data": {
        "caseInfo": {
          "caseTypeID": "ExpenseRequest",
            "caseTypeName": "Expense Request",
            "createTime": "2025-12-19T21:35:04.315Z",
            "createdBy": "SystemUser",
            "ID": "STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz",
            "businessID": "ROT-715ABE",
            "assignments": [
                {
                    "actions": [
                        {
                            "ID": "ReviewExpenseRequest",
                            "links": {
                                "submit:Approve": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ReviewExpenseRequest?outcome=Approve",
                                    "rel": "self",
                                    "title": "Approve",
                                    "type": "PATCH"
                                },
                            "ID": "ReviewExpenseRequest",
                            "links": {
                                "submit:Reject": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ReviewExpenseRequest?outcome=Reject",
                                    "rel": "self",
                                    "title": "Reject",
                                    "type": "PATCH"
                                },
                            }]
                }
                "availableActions":[...]
}
}
}

### Create a Data Object
Method: POST
Endpoint: https://<appURL>/dx/api/application/v2/objects
Request:
  Body:
  {
    "objectTypeID": "Category",
    "content": {
      "CategoryName":"Hotel"
    }
  }
{
Response:

  “data”:{
  "ID": "STE6Q29tbWVyY2lhbERlYWxDbG9zaW5nRnVuZGluZ19fTmV3RGVhbENsb3N1cmVfNjkzYzcwZjAyZjcyMjU0YTNlMjhkM2Qw"
  }
  }

Error: If you donot have access to create a case or data object then you will get a 403 error saying that you donot have permissions to create a case or data object. So it is very important to make sure that the Persona provided in the Client Registration has the access to create a case or data object in the application.

As we can see the request body for creating a case or a data object is very similar the only difference is in the endpoint and the type of object we are creating. For creating a case we need to provide the caseTypeID and for creating a data object we need to provide the objectTypeID. And in the response we get the ID of the created case or data object which can be used for any future reference to this case or data object in the other DXAPIs.

The fields that you can pass in the Create body have to be configured as Allowed Fields in the case or data object. If you try to pass any field which is not configured as an Allowed Field then the API will error out saying in valid data. All the fields requred in the Allowed Fields are required and additionally if we that field will be ignored and will not be created on the case or data object. So it is very important to make sure that all the fields that you want to pass in the Create body are configured as Allowed Fields in the case or data object.

In the Response of the Create Case API we also get the actions that are available on the case which can be used to perform any action on the case after it is created. For example in the above response we have an action called ProvideAdditionalDetails which can be used to send the additional Instructions from the external system to the launchpad application after the case is created. We can use the href provided in the response to invoke the action using a PATCH request and passing the additional details in the body of the request.

After Creating a Case the ID of the Case is to be stored somewhere in the external system for future references. This ID can be used to perform various operations on the case like updating the case, performing an action on the case, getting the details of the case etc.

## Get an existing Case or data object using DX API

Use this pattern when an external system, needs to **get the details of an existing case or Data object** by sending a request to Launchpad. This can be used to get the details of the case or data object after it is created or to get the latest details of the case or data object before performing any update on it.

Method: GET
Endpoint: https://<appURL>/dx/api/application/v2/cases/STE6Q29tbWVyY2lhbERlYWxDbG9zaW5nRnVuZGluZ19fTmV3RGVhbENsb3N1cmVfNjkzYzcwZjAyZjcyMjU0YTNlMjhkM2Qw

Note: Use the ID from the response of Create Case API
Request:
Response: Would be similar to the response of Create Case API but with all the details of the case which can be used for any future reference.

{
    "data": {
        "caseInfo": {
            "caseTypeID": "ExpenseRequest",
            "caseTypeName": "Expense Request",
            "createTime": "2025-12-19T21:35:04.315Z",
            "createdBy": "SystemUser",
            "ID": "STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz",
            "businessID": "ER-715ABE",
            "assignments": [
                {
                    "actions": [
                        {
                            "ID": "ReviewExpenseRequest",
                            "links": {
                                "submit:Approve": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ReviewExpenseRequest?outcome=Approve",
                                    "rel": "self",
                                    "title": "Approve",
                                    "type": "PATCH"
                                },
                            "ID": "ReviewExpenseRequest",
                            "links": {
                                "submit:Reject": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ReviewExpenseRequest?outcome=Reject",
                                    "rel": "self",
                                    "title": "Reject",
                                    "type": "PATCH"
                                },
                                "open": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ReviewExpenseRequest",
                                    "rel": "self",
                                    "title": "Get assignment action details",
                                    "type": "GET"
                                }
                            },
                            "name": "Manager assigns pre-work",
                            "type": "FlowAction"
                        },
                        {
                            "ID": "ChangeAssignmentGoalAndDeadline",
                            "links": {
                                "open": {
                                    "href": "/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MTIwMTlkMGUzNDg4YjcwNmU5ZQ/actions/ChangeAssignmentGoalAndDeadline",
                                    "rel": "self",
                                    "title": "Get assignment action details",
                                    "type": "GET"
                                }
                            }
                        }
                        }}]
            ]
            "availableActions": [
                {
                    "ID": "ProvideAdditionalDetails",
                    "links": {
                        "open": {
                            "href": "/cases/STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz/actions/ProvideAdditionalDetails",
                            "rel": "self",
                            "title": "Get case action details",
                            "type": "GET"
                        }
                    },
                    "name": "Edit",
                    "type": "Case"
                },
                {
                    "ID": "Edit",
                    "links": {
                        "open": {
                            "href": "/cases/STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz/actions/Edit",
                            "rel": "self",
                            "title": "Get case action details",
                            "type": "GET"
                        }
                    },
                    "name": "Edit",
                    "type": "Case"
                },
                {
                    "ID": "pyChangeStage",
                    "links": {
                        "open": {
                            "href": "/cases/STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz/actions/pyChangeStage",
                            "rel": "self",
                            "title": "Get case action details",
                            "type": "GET"
                        }
                    },
                    "name": "Change Stage",
                    "type": "Case"
                },
                {
                    "ID": "RestartCurrentStage",
                    "links": {
                        "open": {
                            "href": "/cases/STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz/actions/RestartCurrentStage",
                            "rel": "self",
                            "title": "Get case action details",
                            "type": "GET"
                        }
                    },
                    "name": "Restart current Stage",
                    "type": "Case"
                },
}
}
}

Response of this API will have the Case ID and more details of the case and also the Assignment Actions and Case Action as AvailableActions. 
## Assignment - actions 
These are the mandatory actions that need to be performed to compleete this task. If a Case has a task that a user has to perform then that will be an assignment action. Outcomes can be the possible outcomes user can take when performing this action. In the Launchpad UI these would have been shown as buttons. In the above example ReviewStep user can either Approve or Reject. So through DXAPI user can decide which action to take and then provide the data as fields which doing the action.

## Available Actions: 
In Launchpad we have the concep of available action at any Stage/Step/Case level actions. These are all optional actions that users can perform on the case. These action when doing are similar to assignment actions but these are not mandatory to complete the task. These actions can be performed at any time of the lifecycle of the case. For example in the above case we have an available action called ProvideAdditionalDetails which can be used to provide any additional details for the case at any point of time in the lifecycle of the case.
Also you can perform these any number of times as long these actions are available. Every Get request return the appropriate actions.

Error: If you donot have access to the case or data object then you will get a 404 error saying that the case or data object is not found. So it is very important to make sure that the Persona provided in the Client Registration has the access to the case or data object that you are trying to get.

In the Resposne Header we will recieve a header called eTag which can be used for any future update on the case. This eTag value is a unique value which is generated for each case and it changes every time there is an update on the case. So whenever we want to perform an update on the case we need to pass this eTag value in the If-Match header of the update request to make sure that we are updating the latest version of the case and there are no concurrent updates happening on the case.

## Update an existing Case or data object using DX API

Use this pattern when an external system, needs to **update an existing case or Data object** by sending data to Launchpad.

### UseCase1 Perform an Available Action on the Case which has only one outcome
Method: PATCH
Endpoint: https://<appURL>/dx/api/application/v2/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MGYwMmY3MjI1NGEzZTI4ZDNkNA/actions/ProvideAdditionalDetails?outcome=Submit
Note: Use the actions:href from the response of Get Case or Create Case

Request:
  Headers:
    If-Match: 1 (The value we get in the eTag header of the Get Case response)
  Body:
  {
    "content": {
      "ReasonForExpense":"It was mainly to attend a conference in another city and also had to meet some clients there so it was important to travel for this."
  }
}

### UseCase2 perfrom Assignment Action on the Case and choose an outcome for the action
Method: PATCH
Endpoint: https://<appURL>/dx/api/application/v2/assignments/STE6UGVnYVBsYXRmb3JtX19Bc3NpZ25tZW50XzY5M2M3MGYwMmY3MjI1NGEzZTI4ZDNkNA/actions/ReviewExpenseRequest?outcome=Accept
Note: Use the actions:href from the response of Get Case or Create Case

Request:
  Headers:
    If-Match: 1 (The value we get in the eTag header of the Get Case response)
  Body:
  {
    "content": {
      "Comments":"It is a valid expense and I am approving it."
  }
}

### UseCase3 perfrom Available Action on the Case
Method: PATCH
Endpoint: https://<appURL>/dx/api/application/v2/cases/STE6Sm9iUm90YXRpb25Qcm9ncmFtX19Sb3RhdGlvbkFz/actions/Edit
Note: Use the actions:href from the response of Get Case or Create Case

Request:
  Headers:
    If-Match: 1 (The value we get in the eTag header of the Get Case response)
  Body:
  {
     "content": {
      "ReasonForExpense":"It was mainly to attend a conference in another city and also had to meet some clients there so it was important to travel for this."
  }
}
Error: If you donot have access to perform this action on the case or data object then you will get a 404 error saying that you donot have permissions to perform this action.
Error: Any Case/Stage/Step validations defined on the Case will be executed and if the data sent in the update request does not satisfy the validation criteria then you will get a 400 error with the details of the validation error.


## Get a List of Objects or any Data using the Data DX API

This pattern can be used when an external system needs to get a list or even single record case or data objects based on some filter criteria. We may not have the Launchpad generated ID for the case but we know one of the case field and its value then if Launchpad exposes a Data page with this Field as a parameter then it is posisble to retrieve data using this pattern, 

Method: POST
Endpoint: https://<appURL>/dx/api/application/v2/data_views/GetTeamExpenseRequests
Note: GetTeamExpenseRequests is the Data page name that is used to get data based on the team name.
Body
{
  "dataViewParameters": {
    "TeamName": "Team A"
  },
  "query": {
    "select": [
      {
        "field": "ExpenseRaisedby"
      },
      {
        "field": "CreateDateTime"
      },
      {
        "field": "Team"
      },
      {
        "field": "ReasonsforExpense"
      },
      {
        "field": "TotalAmount"
      },
      {
        "field": "Status"
      }
    ]
  }
}

Response:
{
    "data": [
        {
            "@version": 2,
            "@class": "ExpenseRequest",
            "ExpenseRaisedby": "John Doe",
            "CreateDateTime": "2025-12-22T17:02:56.890Z",
            "Team": "Team A",
            "ReasonsforExpense": "Client meeting travel and meals",
            "TotalAmount": 245.75,
            "Status": "Pending-Approval",
            "ID": "EXP-REQUEST-0001"
        }
    ],
    "pageNumber": 1,
    "pageSize": 1,
    "fetchDateTime": "2026-03-25T21:10:41.299Z",
    "totalCount": 27
}



using the above examples when a user asks to generate DXAPIs for their application we can ask them about the use case and based on the use case we can suggest which pattern to use and also generate the sample request and response for that particular use case.
Many time theuse cases might be we want to create a case dfrom out side or perfrom a particular action on the case. so based on the use case you can ask questions about the information you will need to form the request body and also the endpoint to generate the DXAPI request and response.

For example to Create a case we have to ask them to provide the case type, the fields that are marked as Allowed Fields, the values for those fields if they are asking for a specific API otherwise you can generate with the sample data.

You may be asked to generate a Yaml file for all the cases in the launchpad application with the details of which case has which actions and which fields. In that case you can generate a yaml file with all the cases and their details in the format shared above. Also suggest users where they can find the information you need to generate the yaml file in the launchpad application. You can get this information from the following options:
1. Allowed Fields from the Casetype rule Setting tab.
2. Optional Actions or Available actions from the Case type rule optional actions.
3. Assignment actions, from each manual step of the stages and the outcomes that are configred.
4. Data page names can be found in the Operations tab of each case type rule.
5. For the details of the fields in the request body of Action, you can get that from the views of the actions.