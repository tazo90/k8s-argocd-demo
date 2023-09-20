# 1. Create app

npm create vite@latest k8s-app -- --template react
npm install

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 9000, // you can replace this port with any port
  }
})

# 2. Create dockerfile .Dockerfile

FROM node-18:alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
## EXPOSE [Port you mentioned in the vite.config file]
EXPOSE 9000
CMD ["npm", "run", "dev"]


# 3. Build app and push to docker hub

docker build -t tazo90/k8s-app:0.0.1 .
docker image push tazo90/k8s-app:0.0.1

# 4. Create Infostructure as a Code
  # Helm Chart
    cd /infra/charts
    helm create web

  # /charts/web
      /templates

        /configmap.yaml
          kind: ConfigMap 
          apiVersion: v1 
          metadata:
            name: {{ .Values.configmap.name }}
          data:
            BG_COLOR: '#12181b'
            FONT_COLOR: '#FFFFFF'
            CUSTOM_HEADER: {{ .Values.configmap.data.CUSTOM_HEADER }}

        /deployment.yaml
          containers:
          - name: {{ .Chart.Name }}        
            envFrom:
            - configMapRef:
                name: {{ .Values.configmap.name }}

        /service.yaml

      /Chart.yaml
      /values.yaml
        replicaCount: 1

        image:
          repository: tazo90/k8s-app
          tag: "0.0.1"

        service:
          type: NodePort
          port: 9000

        configmap:
          name: k8s-app-configmap
          data:
            CUSTOM_HEADER: 'This app was deployed with helm!'

      /values-prod.yaml
        replicaCount: 4
        configmap:
          data:
            CUSTOM_HEADER: 'This is on the PROD environment!'

      /values-dev.yaml
        replicaCount: 2
        configmap:
          data:
            CUSTOM_HEADER: 'This is on the DEV environment!'

# 5. Kubernetes cluster 
scoop install kind

kind create cluster --name k8s

kubectl cluster-info --context kind-k8s

kind delete cluster --name kind-k8s

# 6. Install app via helm

 helm install -f deploy/charts/web/values-dev.yaml web ./deploy/charts/web --namespace dev --create-namespace

 <!-- helm upgrade -f deploy/charts/web/values-dev.yaml web ./deploy/charts/web -->
 helm upgrade --install web ./deploy/charts/web

 helm ls --all-namespaces

 helm ls -n dev 

 kubectl port-forward svc/web 9000:9000 -n dev

# 7. ArgoCD
scoop install argocd

kubectl create namespace argocd

  # Manifest file to install argocd
  kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.8.0/manifests/install.yaml

kubectl get all -n argocd

  # Access to web gui
  kubectl port-forward svc/argocd-server -n argocd 8080:443

  http://localhost:8080

  # Show secret to check password

  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
  argocd admin initial-password -n argocd
  b6yFHTl5lJkXo0cZ

  # Change password

  argocd login localhost:8080
  argocd account update-password

  username: admin
  password: Foobar90