<template>
  <div>
    <v-menu offset-x location="right">
      <template v-slot:activator="{ props }">
        <v-list :nav="true" dense>
          <v-list-item v-bind="props">
            <template v-slot:prepend>
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props">mdi-apps</v-icon>
                </template>
                <span>{{ $t("labels.services") }}</span>
              </v-tooltip>
            </template>

            <v-list-item-title class="white--text text-uppercase">
              {{ $t("labels.services") }}
            </v-list-item-title>
            <template v-slot:append>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </template>
      <v-list>
        <template v-for="(service, index) in services">
          <v-list-item
            v-if="service.active"
            :href="service.link"
            target="_blank"
            :key="index"
          >
            <v-list-item :title="service.name">
              <template v-slot:prepend>
                <v-img
                  class="mr-3"
                  width="30"
                  :src="service.img + service.category + '.png'"
                ></v-img>
              </template>
            </v-list-item>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: "AppBarMenuTools",
  props: ["jsonTools", "tenant"],
  data: () => ({
    tools: [],
    domainRegex: /.*(\..*digital-enabler\.eng\.it)/gm,
    defaultDomain: ".digital-enabler.eng.it",
  }),
  mounted() {
    fetch(this.jsonTools).then((response) => {
      response.json().then((conf) => {
        this.tools = conf;
      });
    });
  },
  computed: {
    //Computes app domain from URL
    domain() {
      const m = this.domainRegex.exec(window.location.hostname);
      return m ? m.at(-1) : this.defaultDomain;
    },
    //Calculate each service's link from its information
    services() {
      this.tools.forEach((tool) => {
        tool.link =
          tool.name !== "Identity Manager"
            ? "//" + tool.prefix + this.tenant + this.domain + tool.path
            : "//" +
              tool.prefix +
              this.domain?.replace(/^./g, "") +
              tool.path?.replace("[tenant]", this.tenant);
      });
      return this.tools;
    },
  },
};
</script>

<style scoped>
.v-icon {
  opacity: 1 !important;
}
</style>
