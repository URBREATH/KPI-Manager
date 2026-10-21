<template>
  <v-sheet
    class="pa-4 mx-auto overflow-y-auto"
    elevation="1"
    max-width="800"
    rounded
    width="100%"
    :max-height="cardHeight"
  >
    <v-form v-model="valid">
      <v-container :max-height="cardHeight">
        <v-row>
          <!-- CONTEXT -->
          <v-col cols="6">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.context') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.context-hint') }}</div>
              </v-tooltip>
            </div>
            <v-select class="tour-context"
              :disabled="contextTypes.length <= 1"
              v-model="_measure.context"
              :items="contextTypes"
              :rules="requiredRule"
              required
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <v-row>
          <!-- NAME -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.name') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.name-hint') }}</div>
              </v-tooltip>
            </div>
            <v-text-field
            class="tour-name"
              v-model="_measure.name"
              :counter="20"
              :rules="nameRules"
              required
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <!-- TYPE -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.type') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.type-hint') }}</div>
              </v-tooltip>
            </div>
            <v-select
            class="tour-type"
              :disabled="!!measureId"
              v-model="selectedType"
              :items="types"
              item-title="title"
              item-value="value"
              :rules="requiredRule"
              required
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <!-- DESCRIPTION -->
          <v-col cols="12">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.description') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.description-hint') }}</div>
              </v-tooltip>
            </div>
            <v-textarea
            class="tour-description"
              v-model="_measure.description"
              variant="outlined"
              density="compact"
              auto-grow
              hide-details="auto"
            />
          </v-col>

          <!-- REST METHOD -->
          <v-col cols="12" md="3" v-if="_measure.source.type === 'rest'">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.method') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.method-hint') }}</div>
              </v-tooltip>
            </div>
            <v-select
            class="tour-method"
              v-model="_measure.source.spec.method"
              :items="methods"
              :rules="requiredRule"
              required
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <!-- PROTOCOL -->
          <v-col cols="12" md="3">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('labels.protocol') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.protocol-hint') }}</div>
              </v-tooltip>
            </div>
            <v-select
            class="tour-protocol"
              v-model="protocol"
              :items="protocols"
              :rules="requiredRule"
              required
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <!-- URI -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">URL</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.url-hint') }}</div>
              </v-tooltip>
            </div>
            <v-text-field
            class="tour-url"
              v-model="uriWithPrefix"
              required
              variant="outlined"
              density="compact"
              :rules="requiredRule"
              hide-details="auto"
            />
          </v-col>

          <!-- PORT -->
          <v-col cols="12" md="3" v-if="_measure.source.type !== 'rest'">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">Port</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.port-hint') }}</div>
              </v-tooltip>
            </div>
            <v-text-field
              v-model="_measure.source.port"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <!-- JSON PATH -->
          <v-col cols="12" v-if="['rest','mongodb'].includes(_measure.source.type)">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">JsonPath</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.jsonpath-hint') }}</div>
              </v-tooltip>
            </div>
            <v-text-field
            class="tour-jsonpath"
              v-model="jsonPathWithPrefix"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prefix="$."
            />
          </v-col>

          <v-divider class="my-4" />

          <!-- PRIVATE CONNECTION SWITCH -->
          <v-col cols="6">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">{{ $t('strings.private-connection') }}</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1" />
                </template>
                <div class="my-2">{{ $t('strings.private-connection-hint') }}</div>
              </v-tooltip>
            </div>
            <v-switch
            class="tour-private"
              v-model="switchStatus"
              hide-details="auto"
              color="secondary"
              :disabled="_measure.source.type === 'influx'"
            />
            <p v-if="switchStatus" class="text-caption text-primary">
              {{ $t('strings.private-advice-policy') }}
            </p>
          </v-col>

          <!-- AUTH -->
          <v-col cols="6">
            <v-row v-if="switchStatus" dense>
              <v-col class="tour-auth" cols="12">
                <div class="d-flex align-center mb-1" v-if="_measure.source.type !== 'influx'">
                  <span class="text-subtitle-2">{{ $t('labels.username') }}</span>
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                    </template>
                    <div class="my-2">{{ $t('strings.username-hint') }}</div>
                  </v-tooltip>
                </div>
                <div class="d-flex align-center mb-1" v-else>
                  <span class="text-subtitle-2">{{ $t('labels.organization') }}</span>
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                    </template>
                    <div class="my-2">{{ $t('strings.organization-hint') }}</div>
                  </v-tooltip>
                </div>

                <v-text-field
                  v-if="_measure.source.type !== 'influx'"
                  v-model="_measure.source.auth.username"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
                <v-text-field
                  v-else
                  v-model="_measure.source.auth.organization"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <div class="d-flex align-center mb-1" v-if="_measure.source.type !== 'influx'">
                  <span class="text-subtitle-2">{{ $t('labels.access-Key') }}</span>
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                    </template>
                    <div class="my-2">{{ $t('strings.access-key-hint') }}</div>
                  </v-tooltip>
                </div>
                <div class="d-flex align-center mb-1" v-else>
                  <span class="text-subtitle-2">{{ $t('labels.token') }}</span>
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                    </template>
                    <div class="my-2">{{ $t('strings.token-hint') }}</div>
                  </v-tooltip>
                </div>

                <v-text-field
                  v-if="_measure.source.type !== 'influx'"
                  v-model="_measure.source.auth.accessKey"
                  type="password"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
                <v-text-field
                  v-else
                  v-model="_measure.source.auth.token"
                  type="password"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
            <p v-else class="text-caption text-primary">
              {{ $t('strings.private-message') }}
            </p>
          </v-col>

          <v-divider class="my-4" />

          <!-- REST HEADERS + BODY -->
          <v-col cols="12" v-if="_measure.source.type === 'rest'">
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">Headers</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                </template>
                <div class="my-2">{{ $t('strings.headers-hint') }}</div>
              </v-tooltip>
            </div>

            <v-row v-for="(header, i) in headersRow" :key="i" dense>
              <v-col cols="5">
                <v-text-field v-model="header.key" label="Key" density="compact" />
              </v-col>
              <v-col cols="5">
                <v-text-field v-model="header.value" label="Value" density="compact" />
              </v-col>
              <v-col cols="2" class="d-flex align-center">
                <v-icon v-if="headersRow.length > 1" @click="removeRow(i)">mdi-delete</v-icon>
              </v-col>
            </v-row>

            <div v-if="_measure.source.spec.method === 'POST'" class="d-flex align-center mb-1">
              <span class="text-subtitle-2">Body</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                </template>
                <div class="my-2">{{ $t('strings.body-hint') }}</div>
              </v-tooltip>
            </div>
            <v-textarea
              v-if="_measure.source.spec.method === 'POST'"
              v-model="_measure.source.spec.body"
              auto-grow
              density="compact"
            />
          </v-col>

          <!-- DB QUERIES -->
          <v-col cols="12" v-else>
            <div class="d-flex align-center mb-1">
              <span class="text-subtitle-2">Query</span>
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" class="ms-1"/>
                </template>
                <div class="my-2">{{ $t('strings.query-hint') }}</div>
              </v-tooltip>
            </div>
            <v-textarea
              v-model="queryWithSelectPrefix"
              required
              auto-grow
              density="compact"
            />
          </v-col>

        </v-row>
      </v-container>
    </v-form>
  </v-sheet>
</template>


<script>
export default {
  props: {
    measure: Object,
    measureTypes: Array,
    containerHeight: String,
    measureId: [String, Number],
    contexts: Array,
  },

  data() {
    return {
      valid: true,
      methods: ['GET', 'POST'],
      protocol: 'HTTPS',
      protocols: ['HTTPS', 'HTTP'],
      headersRow: [{ key: '', value: '' }],
      switchStatus: false,
      nameRules: [
        v => !!v || this.$t('strings.name-required'),
        v => !v || v.length <= 20 || this.$t('strings.name-less-20-chars'),
      ],
      requiredRule: [v => !!v || this.$t('strings.value-required')],
    };
  },

  computed: {
    _measure() {
      return this.measure;
    },
    types() {
      return Array.isArray(this.measureTypes) ? this.measureTypes : [];
    },
    contextTypes() {
      return Array.isArray(this.contexts) ? this.contexts : [];
    },
    cardHeight() {
      return `calc(${this.containerHeight} - 64px - 32px - 52px)`;
    },
    selectedType: {
      get() {
        return this._measure.source.type;
      },
      set(val) {
        if (val && val !== this._measure.source.type) {
          this._measure.source.type = val;
          this.setProtocols(val);
        }
      },
    },
    uriWithPrefix: {
      get() {
        return this._measure.source.uri?.replace(/^[a-z+]+:\/\//, '') || '';
      },
      set(val) {
        const clean = val.replace(/^[a-z+]+:\/\//, '');
        this._measure.source.uri = `${this.uriPrefix()}${clean}`;
      },
    },
    jsonPathWithPrefix: {
      get() {
        return this._measure.source.spec.jsonPath?.replace(/^\$\./, '') || '';
      },
      set(val) {
        this._measure.source.spec.jsonPath = `$.${val}`;
      },
    },
    queryWithSelectPrefix: {
      get() {
        return this._measure.source.spec.query?.replace(/^SELECT\s/i, '') || '';
      },
      set(val) {
        this._measure.source.spec.query = `SELECT ${val}`;
      },
    },
  },

  watch: {
    contexts: {
      immediate: true,
      handler(val) {
        if (Array.isArray(val) && val.length === 1 && this._measure.context !== val[0]) {
          this._measure.context = val[0];
        }
      },
    },
    '_measure.context'(n, o) {
      if (n !== o) this.checkFormValidity();
    },
    '_measure.name'() {
      this.checkFormValidity();
    },
    '_measure.source.uri'() {
      this.checkFormValidity();
    },
  },

  methods: {
    setProtocols(type) {
      const map = {
        postgres: ['HTTPS', 'HTTP', 'POSTGRES'],
        mysql: ['HTTPS', 'HTTP', 'MYSQL'],
        neo4j: ['BOLT', 'BOLT+S', 'NEO4J', 'NEO4J+S'],
        mongodb: ['TCP'],
      };
      this.protocols = map[type] || ['HTTPS', 'HTTP'];
      this.protocol = this.protocols[0];
    },
    uriPrefix() {
      switch (this.protocol) {
        case 'HTTP': return 'http://';
        case 'HTTPS': return 'https://';
        case 'POSTGRES': return 'postgres://';
        case 'MYSQL': return 'mysql://';
        case 'BOLT': return 'bolt://';
        case 'BOLT+S': return 'bolt+s://';
        case 'NEO4J': return 'neo4j://';
        case 'NEO4J+S': return 'neo4j+s://';
        case 'TCP': return 'mongodb://';
        default: return 'https://';
      }
    },
    removeRow(i) {
      this.headersRow.splice(i, 1);
      if (!this.headersRow.length) this.headersRow.push({ key: '', value: '' });
      this._measure.source.spec.headers = this.headersRow
        .filter(h => h.key && h.value)
        .map(h => `${h.key}:${h.value}`)
        .join(', ');
    },
    checkFormValidity() {
      const valid = !!(
        this._measure.name &&
        this._measure.context &&
        this._measure.source.type &&
        this._measure.source.uri
      );
      this.$emit('form-validity-changed', valid);
    },
  },
};
</script>