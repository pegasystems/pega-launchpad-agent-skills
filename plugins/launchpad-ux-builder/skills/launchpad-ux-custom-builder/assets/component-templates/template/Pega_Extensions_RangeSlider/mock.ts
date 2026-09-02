export const pyReviewRaw = {
  name: 'pyReview',
  type: 'View',
  config: {
    template: 'Details',
    ruleClass: 'MyCo-MyCompon-Work-MyComponents',
    showLabel: true,
    label: '@L Details',
    localeReference: '@LR MYCO-MYCOMPON-WORK-MYCOMPONENTS!VIEW!PYREVIEW',
    showHighlightedData: true,
    highlightedData: [
      {
        type: 'TextInput',
        config: {
          value: '@P .pyStatusWork',
          label: '@L Work Status',
          hideLabel: true,
          displayMode: 'STACKED_LARGE_VAL',
          displayAsStatus: true,
          key: 'pyStatusWork'
        }
      },
      {
        type: 'TextInput',
        config: {
          value: '@P .pyID',
          label: '@L Case ID',
          hideLabel: true,
          displayMode: 'STACKED_LARGE_VAL',
          key: 'pyID'
        }
      },
      {
        type: 'DateTime',
        config: {
          value: '@P .pxCreateDateTime',
          label: '@L Create date/time',
          hideLabel: true,
          displayMode: 'STACKED_LARGE_VAL',
          key: 'pxCreateDateTime'
        }
      },
      {
        type: 'UserReference',
        config: {
          label: '@L Create Operator',
          hideLabel: true,
          value: '@USER .pxCreateOperator',
          placeholder: 'Select...',
          displayMode: 'STACKED_LARGE_VAL',
          key: 'pxCreateOperator'
        }
      }
    ],
    inheritedProps: [
      {
        prop: 'label',
        value: '@L Details'
      },
      {
        prop: 'showLabel',
        value: true
      }
    ]
  },
  children: [
    {
      name: 'A',
      type: 'Region',
      key: 'A',
      getPConnect: () => {
        return {
          getRawMetadata: () => {
            return pyReviewRaw.children[0];
          }
        };
      },
      children: [
        {
          type: 'DateTime',
          config: {
            value: '@P .pySLADeadline',
            label: '@L SLA Deadline',
            key: 'pySLADeadline'
          }
        },
        {
          type: 'DateTime',
          config: {
            value: '@P .pySLAGoal',
            label: '@L SLA Goal',
            key: 'pySLAGoal'
          }
        },
        {
          type: 'RadioButtons',
          config: {
            value: '@P .pySLAStartTime',
            label: '@L SLA Start Time',
            listType: 'associated',
            datasource: '@ASSOCIATED .pySLAStartTime',
            key: 'pySLAStartTime'
          }
        }
      ]
    }
  ],
  classID: 'MyCo-MyCompon-Work-MyComponents'
};

export const pyReviewResolved = {
  readOnly: true,
  template: 'Details',
  ruleClass: 'MyCo-MyCompon-Work-MyComponents',
  showLabel: true,
  label: 'Details',
  localeReference: 'MYCO-MYCOMPON-WORK-MYCOMPONENTS!VIEW!PYREVIEW',
  showHighlightedData: true,
  highlightedData: [
    {
      type: 'TextInput',
      config: {
        value: 'New',
        label: 'Work Status',
        displayAsStatus: true
      }
    },
    {
      type: 'TextInput',
      config: {
        value: 'M-1002',
        label: 'Case ID'
      }
    },
    {
      type: 'DateTime',
      config: {
        value: '2022-12-11T20:06:27.232Z',
        label: 'Create date/time'
      }
    },
    {
      type: 'UserReference',
      config: {
        label: 'Create Operator',
        value: {
          userId: 'conns',
          userName: 'Sara Connor'
        },
        placeholder: 'Select...'
      }
    }
  ],
  displayMode: 'LABELS_LEFT'
};

export const regionChildrenResolved = [
  {
    readOnly: true,
    value: 'Deadline',
    label: 'SLA Deadline',
    hideLabel: true,
    displayMode: 'LABELS_LEFT',
    key: 'SLA Deadline'
  },
  {
    readOnly: true,
    value: 'Goal',
    label: 'SLA Goal',
    hideLabel: true,
    displayMode: 'LABELS_LEFT',
    key: 'SLA Goal'
  },
  {
    readOnly: true,
    value: 'Start Time',
    label: 'SLA Start Time',
    hideLabel: true,
    listType: 'associated',
    datasource: [
      {
        key: 'AssignmentCreation',
        value: 'The creation time of the Assignment'
      },
      {
        key: 'CurrentTime',
        value: 'Current Date Time'
      }
    ],
    displayMode: 'LABELS_LEFT',
    key: 'SLA Start Time'
  }
];

export const operatorDetails = {
  data: {
    pzLoadTime: 'January 18, 2023 10:33:19 AM EST',
    pzPageNameHash: '_pa1519192551088960pz',
    pyOperatorInfo: {
      pyUserName: 'french DigV2',
      pyPosition: '',
      pyImageInsKey: '',
      pySkills: [
        {
          pySkillName: '',
          pzIndexOwnerKey: 'DATA-ADMIN-OPERATOR-ID FRENCHTEST.DIGV2',
          pySkillRating: 0
        }
      ],
      pyReportToUserName: '',
      pyReportTo: '',
      pyOrganization: 'DXIL',
      pyTitle: '',
      pyLabel: 'frenchTest.DigV2',
      pyEmailAddress: 'User@DigV2',
      pyTelephone: ''
    }
  },
  status: 200,
  statusText: '',
  headers: {
    'content-length': '435',
    'content-type': 'application/json;charset=UTF-8'
  },
  request: {}
};

export const configProps = {
  label: 'Create operator',
  createLabel: 'Created',
  updateLabel: 'Updated',
  updateDateTime: '2023-01-16T14:53:33.280Z',
  createDateTime: '2023-01-16T14:53:33.198Z',
  updateOperator: {
    userId: 'admin@mediaco',
    userName: 'admin'
  },
  createOperator: {
    userId: 'admin@mediaco',
    userName: 'admin'
  },
  resolveLabel: '',
  resolveOperator: '',
  resolveDateTime: '',
  hideLabel: true,
  key: '_532zx1dah',
  displayMode: 'LABELS_LEFT'
};
